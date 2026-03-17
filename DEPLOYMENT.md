# Deployment Guide - Energy Dashboard on AWS Amplify

This guide provides step-by-step instructions for deploying the Energy Dashboard application to AWS Amplify.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 18+ and npm installed
- PostgreSQL client (psql) for database setup

## Architecture Overview

The application uses:
- **Frontend**: React + TypeScript hosted on AWS Amplify
- **Backend**: AWS Lambda functions with Node.js
- **API**: Amazon API Gateway (REST API)
- **Database**: Amazon RDS PostgreSQL
- **Authentication**: Amazon Cognito
- **Message Queues**: Amazon SQS
- **Storage**: Amazon S3
- **IoT**: AWS IoT Core for MQTT ingestion

## Deployment Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install infrastructure dependencies
cd infrastructure
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Deploy Infrastructure with AWS CDK

```bash
cd infrastructure

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy the stack
npx cdk deploy

# Note the outputs - you'll need these values:
# - DatabaseEndpoint
# - DatabaseSecretArn
# - UserPoolId
# - UserPoolClientId
# - IdentityPoolId
# - ApiEndpoint
# - IngestionQueueUrl
# - AnomalyQueueUrl
# - AlertQueueUrl
```

### 3. Initialize Database

```bash
# Get database credentials from AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id <DatabaseSecretArn> --query SecretString --output text

# Connect to RDS instance
psql -h <DatabaseEndpoint> -U postgres -d energy_dashboard

# Run schema creation
\i database/schema.sql

# Load seed data (optional)
\i database/seed.sql
```

### 4. Configure Backend Environment

Create `.env` file in `backend/` directory:

```env
DB_SECRET_ARN=<DatabaseSecretArn from CDK output>
INGESTION_QUEUE_URL=<IngestionQueueUrl from CDK output>
ANOMALY_QUEUE_URL=<AnomalyQueueUrl from CDK output>
ALERT_QUEUE_URL=<AlertQueueUrl from CDK output>
EVENT_BUCKET=<EventBucketName from CDK output>
```

### 5. Build and Deploy Backend Functions

The Lambda functions are automatically deployed by CDK, but if you need to update them:

```bash
cd backend
npm run build

# Functions are deployed via CDK
cd ../infrastructure
npx cdk deploy
```

### 6. Configure Frontend

Create `.env` file in `frontend/` directory:

```env
VITE_USER_POOL_ID=<UserPoolId from CDK output>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId from CDK output>
VITE_IDENTITY_POOL_ID=<IdentityPoolId from CDK output>
VITE_API_ENDPOINT=<ApiEndpoint from CDK output>
VITE_AWS_REGION=us-east-1
```

### 7. Deploy Frontend to AWS Amplify

#### Option A: Using Amplify Console (Recommended)

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Base directory: `frontend`
   - Output directory: `dist`
5. Add environment variables from `.env` file
6. Deploy

#### Option B: Using Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
cd frontend
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### 8. Create Cognito Users

```bash
# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id <UserPoolId> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com \
  --temporary-password TempPassword123!

# Set permanent password (user will be prompted on first login)
```

### 9. Configure IoT Core for MQTT Ingestion

```bash
# Create IoT policy (already created by CDK)
# Attach policy to certificate

# Test MQTT ingestion
aws iot-data publish \
  --topic "energy/meters/test" \
  --payload '{"deviceId":"meter-001","value":2.5,"metric":"electric_kw","timestamp":"2024-01-01T12:00:00Z"}'
```

### 10. Verify Deployment

1. **Frontend**: Navigate to Amplify app URL
2. **Login**: Use Cognito credentials
3. **API**: Test API endpoints via dashboard
4. **Database**: Verify data in RDS
5. **Monitoring**: Check CloudWatch logs

## Post-Deployment Configuration

### Configure Integrations

#### Home Assistant Integration

1. Navigate to Integrations page in dashboard
2. Add Home Assistant integration
3. Enter Home Assistant URL and long-lived access token
4. Configure device mappings

#### UniFi Integration

1. Add UniFi Controller integration
2. Enter controller URL and credentials
3. Map network events to properties/units

### Set Up Alert Rules

1. Navigate to Alerts page
2. Create alert rules for:
   - High usage thresholds
   - Leak detection
   - Anomaly detection
3. Configure notification channels (email, SMS)

### Configure Baselines

Baselines are automatically calculated after 7 days of data collection. To manually trigger:

```sql
-- Run baseline calculation
SELECT calculate_baselines();
```

## Monitoring and Maintenance

### CloudWatch Dashboards

Monitor the following metrics:
- Lambda function invocations and errors
- API Gateway request count and latency
- SQS queue depth
- RDS connections and CPU usage

### Database Maintenance

```sql
-- Vacuum and analyze tables weekly
VACUUM ANALYZE sensor_readings;
VACUUM ANALYZE usage_rollups_hourly;
VACUUM ANALYZE usage_rollups_daily;

-- Archive old data (older than 1 year)
DELETE FROM sensor_readings WHERE timestamp < NOW() - INTERVAL '1 year';
```

### Cost Optimization

1. **Enable RDS auto-scaling** for read replicas during peak hours
2. **Configure S3 lifecycle policies** to move old raw events to Glacier
3. **Use Lambda reserved concurrency** for critical functions
4. **Enable API Gateway caching** for frequently accessed endpoints

## Troubleshooting

### Frontend Issues

**Issue**: White screen after deployment
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure API endpoint is accessible

**Issue**: Authentication fails
- Verify Cognito User Pool and Client IDs
- Check CORS configuration on API Gateway
- Ensure user exists in Cognito

### Backend Issues

**Issue**: Lambda timeout
- Increase timeout in CDK stack
- Check database connection pool settings
- Review CloudWatch logs

**Issue**: Database connection errors
- Verify Lambda is in same VPC as RDS
- Check security group rules
- Verify database credentials in Secrets Manager

### Data Ingestion Issues

**Issue**: Readings not appearing
- Check SQS queue for messages
- Verify Lambda function is triggered
- Review ingestion Lambda logs
- Validate device mapping exists

## Scaling Considerations

### Horizontal Scaling

- **Lambda**: Automatically scales with concurrency
- **RDS**: Add read replicas for read-heavy workloads
- **API Gateway**: Supports unlimited requests (with throttling)

### Vertical Scaling

- **RDS**: Increase instance size as needed
- **Lambda**: Increase memory allocation (also increases CPU)

### Data Partitioning

For large deployments (>1000 units):

```sql
-- Partition sensor_readings by month
CREATE TABLE sensor_readings_2024_01 PARTITION OF sensor_readings
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Security Best Practices

1. **Enable encryption at rest** for RDS and S3
2. **Use VPC endpoints** for AWS services
3. **Implement WAF rules** on API Gateway
4. **Rotate database credentials** regularly
5. **Enable CloudTrail** for audit logging
6. **Use least privilege IAM policies**

## Backup and Disaster Recovery

### Automated Backups

- **RDS**: Automated daily backups (7-day retention)
- **S3**: Versioning enabled for raw events
- **Database**: Point-in-time recovery enabled

### Manual Backup

```bash
# Backup database
pg_dump -h <DatabaseEndpoint> -U postgres energy_dashboard > backup.sql

# Upload to S3
aws s3 cp backup.sql s3://backup-bucket/energy-dashboard/$(date +%Y%m%d).sql
```

### Disaster Recovery

1. **RDS**: Restore from automated backup or snapshot
2. **Lambda**: Redeploy from source code
3. **Frontend**: Redeploy from Git repository
4. **Configuration**: Store in version control

## Support and Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Amplify Documentation**: https://docs.amplify.aws/
- **CDK Documentation**: https://docs.aws.amazon.com/cdk/
- **Project Repository**: [Your Git repository URL]

## License

[Your License]
