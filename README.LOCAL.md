# Local Development Quick Start

This guide will get you up and running with the Energy Dashboard locally in under 5 minutes.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

## Quick Start (Windows)

```powershell
# Run the setup script
.\scripts\dev-setup.ps1

# Start development servers
npm run dev
```

## Quick Start (Linux/Mac)

```bash
# Make script executable
chmod +x scripts/dev-setup.sh

# Run the setup script
./scripts/dev-setup.sh

# Start development servers
make dev
# or
npm run dev
```

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
npm install
cd infrastructure && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Start Docker Services

```bash
docker-compose up -d
```

Wait about 15 seconds for services to initialize.

### 3. Initialize Database

```bash
# Using npm scripts
npm run db:init
npm run db:seed

# Or using Makefile (Linux/Mac)
make db-init
make db-seed

# Or manually
docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/01-schema.sql
docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/02-seed.sql
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately
cd frontend && npm run dev  # Terminal 1
cd backend && npm run dev   # Terminal 2
```

## Access Points

Once running, you can access:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | admin@local.dev / Admin123! |
| **Backend API** | http://localhost:4000 | - |
| **pgAdmin** | http://localhost:5050 | admin@energy-dash.local / admin |
| **LocalStack** | http://localhost:4566 | - |
| **MQTT Broker** | mqtt://localhost:1883 | anonymous |

## Common Commands

### Using npm scripts (Windows/Linux/Mac)

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View logs

# Database
npm run db:init          # Initialize schema
npm run db:seed          # Load seed data
npm run db:reset         # Reset database (drop + recreate + seed)

# Testing
npm test                 # Run all tests
```

### Using Makefile (Linux/Mac)

```bash
# Setup
make setup              # Complete setup (install + start + db-init)
make install            # Install dependencies only

# Development
make dev                # Start both servers
make dev-frontend       # Start frontend only
make dev-backend        # Start backend only

# Services
make start              # Start Docker services
make stop               # Stop Docker services
make restart            # Restart Docker services
make logs               # View all logs
make logs-db            # View database logs

# Database
make db-init            # Initialize schema
make db-seed            # Load seed data
make db-reset           # Reset database
make db-shell           # Open PostgreSQL shell
make db-backup          # Backup database

# Testing
make test               # Run all tests
make lint               # Run linters
make format             # Format code

# Cleanup
make clean              # Remove node_modules and build artifacts
make clean-all          # Remove everything including Docker volumes
```

## Testing the Setup

### 1. Check Services

```bash
# Check Docker services
docker-compose ps

# All services should show "Up" status
```

### 2. Test Database Connection

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d energy_dashboard

# Run a test query
SELECT COUNT(*) FROM properties;

# Should return 2 (from seed data)
# Type \q to exit
```

### 3. Test Backend API

```bash
# Health check
curl http://localhost:4000/health

# Get properties
curl http://localhost:4000/api/properties
```

### 4. Test Frontend

Open http://localhost:3000 in your browser. You should see the login page.

Login with:
- Email: `admin@local.dev`
- Password: `Admin123!`

## Development Workflow

### Making Changes

1. **Backend Changes**: Edit files in `backend/src/` - nodemon will auto-reload
2. **Frontend Changes**: Edit files in `frontend/src/` - Vite will hot-reload
3. **Database Changes**: 
   - Edit `database/schema.sql` for schema changes
   - Run `npm run db:reset` to apply changes

### Adding New Dependencies

```bash
# Backend
cd backend
npm install <package-name>

# Frontend
cd frontend
npm install <package-name>
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f localstack

# Backend application logs
cd backend && npm run dev  # Logs appear in terminal

# Frontend application logs
cd frontend && npm run dev  # Logs appear in browser console
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Docker Services Won't Start

```bash
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v

# Restart
docker-compose up -d
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### LocalStack Not Working

```bash
# Restart LocalStack
docker-compose restart localstack

# Re-run initialization
docker-compose exec localstack /etc/localstack/init/ready.d/init.sh
```

### Frontend Won't Connect to Backend

1. Check backend is running: http://localhost:4000/health
2. Check CORS settings in `backend/src/index.ts`
3. Verify `.env.local` has correct `VITE_API_ENDPOINT`

## Testing MQTT Integration

```bash
# Install mosquitto clients
# Windows: Download from https://mosquitto.org/download/
# Linux: sudo apt-get install mosquitto-clients
# Mac: brew install mosquitto

# Subscribe to test topic
mosquitto_sub -h localhost -p 1883 -t "energy/meters/#" -v

# Publish test message (in another terminal)
mosquitto_pub -h localhost -p 1883 -t "energy/meters/test" -m '{"deviceId":"meter-001","value":2.5,"metric":"electric_kw"}'
```

## Simulating Device Data

Use the included test script to simulate device readings:

```bash
# Coming soon: Test data generator
node scripts/simulate-devices.js
```

## Next Steps

- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for AWS deployment
- Check [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed development guide
- Explore the API at http://localhost:4000/api/
- Configure integrations in the dashboard

## Getting Help

- Check Docker logs: `docker-compose logs -f`
- Check application logs in terminal
- Review error messages in browser console
- Ensure all prerequisites are installed
- Try `make clean-all && make setup` for a fresh start
