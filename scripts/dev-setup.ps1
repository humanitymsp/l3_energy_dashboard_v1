# PowerShell script for Windows local development setup

Write-Host "Energy Dashboard - Local Development Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose not found. Please install Docker Compose" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Install root dependencies
npm install

# Install infrastructure dependencies
Set-Location infrastructure
npm install
Set-Location ..

# Install backend dependencies
Set-Location backend
npm install
Set-Location ..

# Install frontend dependencies
Set-Location frontend
npm install
Set-Location ..

Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/01-schema.sql
docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/02-seed.sql

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development servers, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or start them separately:" -ForegroundColor Cyan
Write-Host "  cd frontend && npm run dev   # Frontend at http://localhost:3000" -ForegroundColor White
Write-Host "  cd backend && npm run dev    # Backend at http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  Frontend:   http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:    http://localhost:4000" -ForegroundColor White
Write-Host "  pgAdmin:    http://localhost:5050 (admin@energy-dash.local / admin)" -ForegroundColor White
Write-Host "  LocalStack: http://localhost:4566" -ForegroundColor White
Write-Host "  MQTT:       mqtt://localhost:1883" -ForegroundColor White
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@local.dev" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
