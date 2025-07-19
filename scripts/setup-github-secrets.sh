#!/bin/bash

# GitHub Secrets Setup Script
# This script configures GitHub repository secrets for CI/CD

set -e

echo "🔐 Setting up GitHub Secrets for FIDES Mentorship System..."

# Load deployment tokens
if [ -f ".env.deployment" ]; then
    export $(cat .env.deployment | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.deployment file not found!"
    echo "Please ensure the deployment tokens are configured."
    exit 1
fi

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN not found in .env.deployment!"
    exit 1
fi

# Get repository information
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter your repository name (default: fides-mentorship-system): " REPO_NAME
REPO_NAME=${REPO_NAME:-fides-mentorship-system}

REPO="$GITHUB_USER/$REPO_NAME"

echo "Setting secrets for repository: $REPO"

# Install GitHub CLI if not installed
if ! command -v gh &> /dev/null; then
    echo "📦 Installing GitHub CLI..."
    # Instructions for different OS
    echo "Please install GitHub CLI from: https://cli.github.com/"
    echo "Then run this script again."
    exit 1
fi

# Authenticate with GitHub
echo "🔐 Authenticating with GitHub..."
echo $GITHUB_TOKEN | gh auth login --with-token

# Function to set secret
set_secret() {
    local name=$1
    local value=$2
    echo "Setting secret: $name"
    echo "$value" | gh secret set "$name" --repo="$REPO"
}

# Set deployment tokens
echo "📝 Setting deployment secrets..."
set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
set_secret "RAILWAY_TOKEN" "$RAILWAY_TOKEN"

# Set other required secrets
echo ""
echo "🔧 Now you need to manually add these secrets in GitHub:"
echo "1. Go to https://github.com/$REPO/settings/secrets/actions"
echo "2. Add the following secrets:"
echo ""
echo "For Vercel:"
echo "  - VERCEL_ORG_ID: (get from Vercel dashboard)"
echo "  - VERCEL_PROJECT_ID: (get from Vercel dashboard after first deployment)"
echo ""
echo "For Backend:"
echo "  - JWT_SECRET: $(openssl rand -base64 32)"
echo "  - SENDGRID_API_KEY: (your SendGrid API key)"
echo "  - TWILIO_ACCOUNT_SID: (your Twilio account SID)"
echo "  - TWILIO_AUTH_TOKEN: (your Twilio auth token)"
echo ""
echo "For Monitoring (optional):"
echo "  - SENTRY_AUTH_TOKEN: (your Sentry auth token)"
echo "  - SENTRY_ORG: (your Sentry organization)"
echo "  - CODECOV_TOKEN: (your Codecov token)"
echo "  - SLACK_WEBHOOK: (your Slack webhook URL)"
echo ""
echo "✅ Basic secrets configured! Please add the remaining secrets manually."