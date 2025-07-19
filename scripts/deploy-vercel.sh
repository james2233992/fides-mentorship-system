#!/bin/bash

# Vercel Deployment Script for FIDES Frontend
# This script deploys the frontend to Vercel using the provided token

set -e

echo "🚀 Starting Vercel deployment for FIDES Frontend..."

# Load deployment tokens
if [ -f ".env.deployment" ]; then
    export $(cat .env.deployment | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.deployment file not found!"
    echo "Please ensure the deployment tokens are configured."
    exit 1
fi

# Check if Vercel token is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN not found in .env.deployment!"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project first
echo "🔨 Building frontend..."
npm install
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

if [ "$1" == "production" ]; then
    echo "Deploying to production..."
    vercel --token=$VERCEL_TOKEN --prod --yes
else
    echo "Deploying to preview..."
    vercel --token=$VERCEL_TOKEN --yes
fi

echo "✅ Vercel deployment completed!"
echo ""
echo "Next steps:"
echo "1. Check your Vercel dashboard for the deployment URL"
echo "2. Update the NEXT_PUBLIC_API_URL in Vercel project settings"
echo "3. Configure custom domain if needed"