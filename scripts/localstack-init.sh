#!/bin/bash

# LocalStack initialization script for AWS services
echo "Initializing LocalStack services..."

# Wait for LocalStack to be ready
sleep 5

# Create SQS Queues
echo "Creating SQS queues..."
awslocal sqs create-queue --queue-name ingestion-queue
awslocal sqs create-queue --queue-name anomaly-queue
awslocal sqs create-queue --queue-name alert-queue
awslocal sqs create-queue --queue-name ingestion-dlq
awslocal sqs create-queue --queue-name anomaly-dlq
awslocal sqs create-queue --queue-name alert-dlq

# Create S3 Buckets
echo "Creating S3 buckets..."
awslocal s3 mb s3://energy-dash-events
awslocal s3 mb s3://energy-dash-backups
awslocal s3 mb s3://energy-dash-exports

# Create SNS Topics
echo "Creating SNS topics..."
awslocal sns create-topic --name alert-notifications
awslocal sns create-topic --name system-events

# Create Secrets Manager secrets
echo "Creating Secrets Manager secrets..."
awslocal secretsmanager create-secret \
  --name energy-dash/db-credentials \
  --secret-string '{"username":"postgres","password":"postgres","host":"postgres","port":"5432","database":"energy_dashboard"}'

# Create Cognito User Pool (basic setup)
echo "Creating Cognito User Pool..."
POOL_ID=$(awslocal cognito-idp create-user-pool \
  --pool-name energy-dash-local \
  --policies '{"PasswordPolicy":{"MinimumLength":8}}' \
  --auto-verified-attributes email \
  --query 'UserPool.Id' \
  --output text)

echo "User Pool ID: $POOL_ID"

# Create Cognito User Pool Client
CLIENT_ID=$(awslocal cognito-idp create-user-pool-client \
  --user-pool-id $POOL_ID \
  --client-name energy-dash-client \
  --no-generate-secret \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "User Pool Client ID: $CLIENT_ID"

# Create test user
echo "Creating test user..."
awslocal cognito-idp admin-create-user \
  --user-pool-id $POOL_ID \
  --username admin@local.dev \
  --user-attributes Name=email,Value=admin@local.dev Name=email_verified,Value=true \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
awslocal cognito-idp admin-set-user-password \
  --user-pool-id $POOL_ID \
  --username admin@local.dev \
  --password Admin123! \
  --permanent

echo "LocalStack initialization complete!"
echo "User Pool ID: $POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Test User: admin@local.dev / Admin123!"
