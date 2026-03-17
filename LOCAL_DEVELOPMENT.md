# Local Development Guide

This guide helps you set up the Energy Dashboard for local development.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker and Docker Compose (optional, for containerized development)
- AWS CLI configured with development credentials

## Quick Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec db psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/schema.sql

# Load seed data
docker-compose exec db psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/seed.sql

# Start frontend dev server
cd frontend
npm install
npm run dev

# Start backend dev server (in another terminal)
cd backend
npm install
npm run dev
```

## Manual Setup

### 1. Database Setup

```bash
# Create database
createdb energy_dashboard

# Run schema
psql -d energy_dashboard -f database/schema.sql

# Load seed data
psql -d energy_dashboard -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energy_dashboard
DB_USER=postgres
DB_PASSWORD=postgres
AWS_REGION=us-east-1
INGESTION_QUEUE_URL=http://localhost:9324/queue/ingestion
ANOMALY_QUEUE_URL=http://localhost:9324/queue/anomaly
ALERT_QUEUE_URL=http://localhost:9324/queue/alert
EVENT_BUCKET=local-events
EOF

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_ENDPOINT=http://localhost:4000
VITE_USER_POOL_ID=local
VITE_USER_POOL_CLIENT_ID=local
VITE_IDENTITY_POOL_ID=local
VITE_AWS_REGION=us-east-1
EOF

# Start development server
npm run dev
```

### 4. Local AWS Services (Optional)

Use LocalStack for local AWS service emulation:

```bash
# Install LocalStack
pip install localstack

# Start LocalStack
localstack start

# Create local SQS queues
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name ingestion
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name anomaly
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name alert

# Create local S3 bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://local-events
```

## Docker Compose Configuration

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: energy_dashboard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      SERVICES: sqs,s3,secretsmanager
      DEBUG: 1
    volumes:
      - localstack_data:/tmp/localstack

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  localstack_data:
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Infrastructure tests
cd infrastructure
npm test
```

### Linting and Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

### Database Migrations

```bash
# Create new migration
cat > database/migrations/001_add_new_table.sql << EOF
-- Migration: Add new table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW()
);
EOF

# Run migration
psql -d energy_dashboard -f database/migrations/001_add_new_table.sql
```

### Testing Ingestion

```bash
# Send test reading via HTTP
curl -X POST http://localhost:4000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "mqtt_meter",
    "propertyExternalId": "prop-001",
    "deviceExternalId": "meter-001",
    "metricType": "electric_kw",
    "value": 2.5,
    "timestamp": "2024-01-01T12:00:00Z"
  }'

# Verify in database
psql -d energy_dashboard -c "SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 10;"
```

### Debugging

#### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

#### Frontend Debugging

Use React DevTools browser extension and browser debugger.

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo systemctl restart postgresql # Linux
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: Use `nodemon` for auto-restart (included in dev script)

## Environment Variables

### Backend

- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `AWS_REGION`: AWS region for services
- `INGESTION_QUEUE_URL`: SQS queue URL for ingestion
- `ANOMALY_QUEUE_URL`: SQS queue URL for anomaly detection
- `ALERT_QUEUE_URL`: SQS queue URL for alerts

### Frontend

- `VITE_API_ENDPOINT`: Backend API endpoint
- `VITE_USER_POOL_ID`: Cognito User Pool ID
- `VITE_USER_POOL_CLIENT_ID`: Cognito User Pool Client ID
- `VITE_IDENTITY_POOL_ID`: Cognito Identity Pool ID
- `VITE_AWS_REGION`: AWS region

## Tips

1. **Use separate terminals** for frontend, backend, and database logs
2. **Enable source maps** for easier debugging
3. **Use database GUI tools** like pgAdmin or DBeaver
4. **Mock external services** during development
5. **Use environment-specific configs** for different stages

## Next Steps

- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for architecture overview
- Explore the codebase and make improvements!
