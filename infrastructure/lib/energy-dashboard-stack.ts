import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class EnergyDashboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for RDS and Lambda
    const vpc = new ec2.Vpc(this, 'EnergyDashboardVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Security Group for RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: true,
    });

    // Security Group for Lambda
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to access RDS'
    );

    // RDS PostgreSQL Database
    const dbCredentials = new secretsmanager.Secret(this, 'DBCredentials', {
      secretName: 'energy-dashboard/db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'energyadmin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
      },
    });

    const database = new rds.DatabaseInstance(this, 'EnergyDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_1,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(dbCredentials),
      databaseName: 'energydashboard',
      allocatedStorage: 100,
      maxAllocatedStorage: 500,
      storageType: rds.StorageType.GP3,
      multiAz: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      cloudwatchLogsExports: ['postgresql'],
      parameterGroup: new rds.ParameterGroup(this, 'DBParameterGroup', {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_16_1,
        }),
        parameters: {
          'shared_preload_libraries': 'pg_stat_statements,pg_cron',
          'pg_stat_statements.track': 'all',
          'cron.database_name': 'energydashboard',
        },
      }),
    });

    // S3 Bucket for raw event storage
    const eventBucket = new s3.Bucket(this, 'EventBucket', {
      bucketName: `energy-dashboard-events-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'TransitionToIA',
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'energy-dashboard-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        organizationId: new cognito.StringAttribute({ mutable: true }),
        role: new cognito.StringAttribute({ mutable: true }),
      },
    });

    const userPoolClient = userPool.addClient('WebClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
      },
    });

    // SQS Queues
    const ingestionDLQ = new sqs.Queue(this, 'IngestionDLQ', {
      queueName: 'energy-dashboard-ingestion-dlq',
      retentionPeriod: cdk.Duration.days(14),
    });

    const ingestionQueue = new sqs.Queue(this, 'IngestionQueue', {
      queueName: 'energy-dashboard-ingestion',
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: ingestionDLQ,
        maxReceiveCount: 3,
      },
    });

    const anomalyQueue = new sqs.Queue(this, 'AnomalyQueue', {
      queueName: 'energy-dashboard-anomaly',
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const alertQueue = new sqs.Queue(this, 'AlertQueue', {
      queueName: 'energy-dashboard-alert',
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    // SNS Topics for Alerts
    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: 'energy-dashboard-alerts',
      displayName: 'Energy Dashboard Alerts',
    });

    // Lambda Layer for shared dependencies
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/layers/shared')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared dependencies for Energy Dashboard',
    });

    // Environment variables for Lambda functions
    const lambdaEnvironment = {
      DB_SECRET_ARN: dbCredentials.secretArn,
      DB_HOST: database.dbInstanceEndpointAddress,
      DB_PORT: database.dbInstanceEndpointPort,
      DB_NAME: 'energydashboard',
      EVENT_BUCKET: eventBucket.bucketName,
      INGESTION_QUEUE_URL: ingestionQueue.queueUrl,
      ANOMALY_QUEUE_URL: anomalyQueue.queueUrl,
      ALERT_QUEUE_URL: alertQueue.queueUrl,
      ALERT_TOPIC_ARN: alertTopic.topicArn,
      NODE_OPTIONS: '--enable-source-maps',
    };

    // Lambda Functions
    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      functionName: 'energy-dashboard-api',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../backend/src/functions/api/index.ts'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      layers: [sharedLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk', 'pg-native'],
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const ingestionFunction = new NodejsFunction(this, 'IngestionFunction', {
      functionName: 'energy-dashboard-ingestion',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../backend/src/functions/ingestion/index.ts'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      layers: [sharedLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk', 'pg-native'],
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const anomalyFunction = new NodejsFunction(this, 'AnomalyFunction', {
      functionName: 'energy-dashboard-anomaly',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../backend/src/functions/anomaly/index.ts'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      layers: [sharedLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk', 'pg-native'],
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const alertFunction = new NodejsFunction(this, 'AlertFunction', {
      functionName: 'energy-dashboard-alert',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../backend/src/functions/alert/index.ts'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      layers: [sharedLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk', 'pg-native'],
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const rollupFunction = new NodejsFunction(this, 'RollupFunction', {
      functionName: 'energy-dashboard-rollup',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../backend/src/functions/rollup/index.ts'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      layers: [sharedLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk', 'pg-native'],
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const homeAssistantConnectorFunction = new NodejsFunction(this, 'HomeAssistantConnector', {
      functionName: 'energy-dashboard-ha-connector',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../backend/src/functions/connectors/home-assistant/index.ts'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      layers: [sharedLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk', 'pg-native'],
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Grant permissions
    dbCredentials.grantRead(apiFunction);
    dbCredentials.grantRead(ingestionFunction);
    dbCredentials.grantRead(anomalyFunction);
    dbCredentials.grantRead(alertFunction);
    dbCredentials.grantRead(rollupFunction);
    dbCredentials.grantRead(homeAssistantConnectorFunction);

    eventBucket.grantReadWrite(ingestionFunction);
    eventBucket.grantRead(apiFunction);

    ingestionQueue.grantSendMessages(apiFunction);
    ingestionQueue.grantSendMessages(homeAssistantConnectorFunction);
    ingestionQueue.grantConsumeMessages(ingestionFunction);

    anomalyQueue.grantSendMessages(ingestionFunction);
    anomalyQueue.grantConsumeMessages(anomalyFunction);

    alertQueue.grantSendMessages(anomalyFunction);
    alertQueue.grantConsumeMessages(alertFunction);

    alertTopic.grantPublish(alertFunction);

    // SQS Event Sources
    ingestionFunction.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(ingestionQueue, {
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    anomalyFunction.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(anomalyQueue, {
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    alertFunction.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(alertQueue, {
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    // EventBridge Rules for scheduled tasks
    const hourlyRollupRule = new events.Rule(this, 'HourlyRollupRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      description: 'Trigger hourly data rollups',
    });
    hourlyRollupRule.addTarget(new targets.LambdaFunction(rollupFunction, {
      event: events.RuleTargetInput.fromObject({ rollupType: 'hourly' }),
    }));

    const dailyRollupRule = new events.Rule(this, 'DailyRollupRule', {
      schedule: events.Schedule.cron({ hour: '1', minute: '0' }),
      description: 'Trigger daily data rollups',
    });
    dailyRollupRule.addTarget(new targets.LambdaFunction(rollupFunction, {
      event: events.RuleTargetInput.fromObject({ rollupType: 'daily' }),
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'EnergyDashboardApi', {
      restApiName: 'Energy Dashboard API',
      description: 'API for Energy Dashboard',
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const apiIntegration = new apigateway.LambdaIntegration(apiFunction);

    // API Resources
    const propertiesResource = api.root.addResource('properties');
    propertiesResource.addMethod('GET', apiIntegration, { authorizer });
    propertiesResource.addMethod('POST', apiIntegration, { authorizer });

    const propertyResource = propertiesResource.addResource('{propertyId}');
    propertyResource.addMethod('GET', apiIntegration, { authorizer });
    propertyResource.addMethod('PUT', apiIntegration, { authorizer });

    const buildingsResource = propertyResource.addResource('buildings');
    buildingsResource.addMethod('GET', apiIntegration, { authorizer });

    const unitsResource = propertyResource.addResource('units');
    unitsResource.addMethod('GET', apiIntegration, { authorizer });

    const usageResource = api.root.addResource('usage');
    usageResource.addMethod('GET', apiIntegration, { authorizer });

    const anomaliesResource = api.root.addResource('anomalies');
    anomaliesResource.addMethod('GET', apiIntegration, { authorizer });

    const alertsResource = api.root.addResource('alerts');
    alertsResource.addMethod('GET', apiIntegration, { authorizer });
    alertsResource.addMethod('POST', apiIntegration, { authorizer });

    const alertResource = alertsResource.addResource('{alertId}');
    alertResource.addMethod('PUT', apiIntegration, { authorizer });

    const ingestResource = api.root.addResource('ingest');
    ingestResource.addMethod('POST', new apigateway.LambdaIntegration(ingestionFunction), {
      authorizationType: apigateway.AuthorizationType.IAM,
    });

    // IoT Core for MQTT
    const iotPolicy = new iot.CfnPolicy(this, 'IoTPolicy', {
      policyName: 'energy-dashboard-iot-policy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['iot:Connect'],
            Resource: [`arn:aws:iot:${this.region}:${this.account}:client/*`],
          },
          {
            Effect: 'Allow',
            Action: ['iot:Publish'],
            Resource: [
              `arn:aws:iot:${this.region}:${this.account}:topic/energy/meters/*`,
              `arn:aws:iot:${this.region}:${this.account}:topic/energy/sensors/*`,
            ],
          },
          {
            Effect: 'Allow',
            Action: ['iot:Subscribe'],
            Resource: [
              `arn:aws:iot:${this.region}:${this.account}:topicfilter/energy/meters/*`,
              `arn:aws:iot:${this.region}:${this.account}:topicfilter/energy/sensors/*`,
            ],
          },
          {
            Effect: 'Allow',
            Action: ['iot:Receive'],
            Resource: [
              `arn:aws:iot:${this.region}:${this.account}:topic/energy/meters/*`,
              `arn:aws:iot:${this.region}:${this.account}:topic/energy/sensors/*`,
            ],
          },
        ],
      },
    });

    // IoT Topic Rule to route MQTT messages to SQS
    const iotTopicRule = new iot.CfnTopicRule(this, 'IoTTopicRule', {
      topicRulePayload: {
        sql: "SELECT * FROM 'energy/meters/#'",
        actions: [
          {
            sqs: {
              queueUrl: ingestionQueue.queueUrl,
              roleArn: new iam.Role(this, 'IoTRuleRole', {
                assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
                inlinePolicies: {
                  sqsPolicy: new iam.PolicyDocument({
                    statements: [
                      new iam.PolicyStatement({
                        actions: ['sqs:SendMessage'],
                        resources: [ingestionQueue.queueArn],
                      }),
                    ],
                  }),
                },
              }).roleArn,
            },
          },
        ],
        ruleDisabled: false,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'EnergyDashboard-UserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'EnergyDashboard-UserPoolClientId',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'EnergyDashboard-ApiEndpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress,
      description: 'RDS Database endpoint',
      exportName: 'EnergyDashboard-DatabaseEndpoint',
    });

    new cdk.CfnOutput(this, 'EventBucketName', {
      value: eventBucket.bucketName,
      description: 'S3 bucket for event storage',
      exportName: 'EnergyDashboard-EventBucket',
    });

    new cdk.CfnOutput(this, 'IoTEndpoint', {
      value: `${this.account}.iot.${this.region}.amazonaws.com`,
      description: 'AWS IoT Core endpoint',
      exportName: 'EnergyDashboard-IoTEndpoint',
    });
  }
}
