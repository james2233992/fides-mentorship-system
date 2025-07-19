#!/bin/bash

# Railway Deployment Script for FIDES Backend
# This script deploys the backend to Railway using the provided token

set -e

echo "🚂 Starting Railway deployment for FIDES Backend..."

# Load deployment tokens
if [ -f ".env.deployment" ]; then
    export $(cat .env.deployment | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.deployment file not found!"
    echo "Please ensure the deployment tokens are configured."
    exit 1
fi

# Check if Railway token is set
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Error: RAILWAY_TOKEN not found in .env.deployment!"
    exit 1
fi

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd backend

# Build the project
echo "🔨 Building backend..."
npm install
npm run build

# Generate Prisma client
echo "📊 Generating Prisma client..."
npm run prisma:generate

# Login to Railway using token
echo "🔐 Logging in to Railway..."
railway login --token $RAILWAY_TOKEN

# Deploy to Railway
echo "🚂 Deploying to Railway..."

if [ "$1" == "init" ]; then
    echo "Initializing new Railway project..."
    railway init --name fides-backend
    
    # Link PostgreSQL
    echo "🐘 Adding PostgreSQL..."
    railway add --plugin postgresql
    
    # Link Redis
    echo "🔴 Adding Redis..."
    railway add --plugin redis
    
    # Deploy
    railway up
    
    # Run migrations
    echo "🔄 Running database migrations..."
    railway run npm run prisma:migrate:deploy
    
    # Seed database (optional)
    read -p "Do you want to seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway run npm run prisma:seed
    fi
else
    # Regular deployment
    railway up
    
    # Run migrations
    echo "🔄 Running database migrations..."
    railway run npm run prisma:migrate:deploy
fi

echo "✅ Railway deployment completed!"
echo ""
echo "Next steps:"
echo "1. Check your Railway dashboard for the deployment URL"
echo "2. Configure environment variables in Railway:"
echo "   - DATABASE_URL (auto-configured)"
echo "   - REDIS_URL (auto-configured)"
echo "   - JWT_SECRET"
echo "   - SENDGRID_API_KEY"
echo "   - TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN"
echo "   - CORS_ORIGIN (your Vercel frontend URL)"
echo "3. Update the frontend API URL to point to Railway backend"