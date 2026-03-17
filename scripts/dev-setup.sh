#!/bin/bash

# Bash script for Linux/Mac local development setup

set -e

echo "Energy Dashboard - Local Development Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker: $DOCKER_VERSION"
else
    echo "✗ Docker not found. Please install Docker from https://www.docker.com/"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✓ Docker Compose: $COMPOSE_VERSION"
else
    echo "✗ Docker Compose not found. Please install Docker Compose"
    exit 1
fi

echo ""
echo "Installing dependencies..."

# Install root dependencies
npm install

# Install infrastructure dependencies
cd infrastructure && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

echo "✓ Dependencies installed"
echo ""

# Make scripts executable
chmod +x scripts/*.sh

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

echo "Waiting for services to be ready..."
sleep 15

# Initialize database
echo "Initializing database..."
docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/01-schema.sql
docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/02-seed.sql

echo ""
echo "Setup complete!"
echo ""
echo "To start development servers, run:"
echo "  make dev"
echo ""
echo "Or start them separately:"
echo "  cd frontend && npm run dev   # Frontend at http://localhost:3000"
echo "  cd backend && npm run dev    # Backend at http://localhost:4000"
echo ""
echo "Access points:"
echo "  Frontend:   http://localhost:3000"
echo "  Backend:    http://localhost:4000"
echo "  pgAdmin:    http://localhost:5050 (admin@energy-dash.local / admin)"
echo "  LocalStack: http://localhost:4566"
echo "  MQTT:       mqtt://localhost:1883"
echo ""
echo "Test credentials:"
echo "  Email:    admin@local.dev"
echo "  Password: Admin123!"
