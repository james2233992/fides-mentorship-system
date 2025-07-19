#!/bin/bash

# FIDES Mentorship System - Deployment Setup Script
# This script helps set up the deployment environment for Vercel and Railway

set -e

echo "🚀 FIDES Mentorship System - Deployment Setup"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "\n${YELLOW}Checking requirements...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ npm $(npm --version)${NC}"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Git $(git --version)${NC}"
    fi
}

# Install CLIs
install_clis() {
    echo -e "\n${YELLOW}Installing deployment CLIs...${NC}"
    
    # Install Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel@latest
        echo -e "${GREEN}✅ Vercel CLI installed${NC}"
    else
        echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
    fi
    
    # Install Railway CLI
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli@latest
        echo -e "${GREEN}✅ Railway CLI installed${NC}"
    else
        echo -e "${GREEN}✅ Railway CLI already installed${NC}"
    fi
}

# Setup Vercel
setup_vercel() {
    echo -e "\n${YELLOW}Setting up Vercel...${NC}"
    
    cd frontend
    
    # Login to Vercel
    echo "Please login to Vercel:"
    vercel login
    
    # Link project
    echo "Linking Vercel project..."
    vercel link
    
    # Pull environment variables
    echo "Pulling environment variables..."
    vercel env pull .env.production
    
    echo -e "${GREEN}✅ Vercel setup complete${NC}"
    cd ..
}

# Setup Railway
setup_railway() {
    echo -e "\n${YELLOW}Setting up Railway...${NC}"
    
    cd backend
    
    # Login to Railway
    echo "Please login to Railway:"
    railway login
    
    # Initialize project
    echo "Initializing Railway project..."
    railway init
    
    # Link PostgreSQL
    echo "Would you like to add PostgreSQL? (y/n)"
    read -r add_postgres
    if [[ $add_postgres == "y" ]]; then
        railway add postgresql
        echo -e "${GREEN}✅ PostgreSQL added${NC}"
    fi
    
    # Link Redis
    echo "Would you like to add Redis? (y/n)"
    read -r add_redis
    if [[ $add_redis == "y" ]]; then
        railway add redis
        echo -e "${GREEN}✅ Redis added${NC}"
    fi
    
    echo -e "${GREEN}✅ Railway setup complete${NC}"
    cd ..
}

# Create GitHub secrets list
create_secrets_list() {
    echo -e "\n${YELLOW}Creating GitHub secrets list...${NC}"
    
    cat > infrastructure/GITHUB_SECRETS.md << EOF
# GitHub Secrets Required for Deployment

Add these secrets to your GitHub repository settings:

## Vercel Secrets
- \`VERCEL_TOKEN\`: Your Vercel API token
  - Get it from: https://vercel.com/account/tokens
- \`VERCEL_ORG_ID\`: Your Vercel organization ID
  - Found in: .vercel/project.json after running \`vercel link\`
- \`VERCEL_PROJECT_ID\`: Your Vercel project ID
  - Found in: .vercel/project.json after running \`vercel link\`

## Railway Secrets
- \`RAILWAY_TOKEN\`: Your Railway API token
  - Get it from: https://railway.app/account/tokens

## Monitoring Secrets (Optional)
- \`SENTRY_AUTH_TOKEN\`: Sentry authentication token
- \`SENTRY_ORG\`: Your Sentry organization slug
- \`CODECOV_TOKEN\`: Codecov upload token
- \`SLACK_WEBHOOK\`: Slack webhook URL for notifications

## How to Add Secrets
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value
EOF
    
    echo -e "${GREEN}✅ GitHub secrets list created at infrastructure/GITHUB_SECRETS.md${NC}"
}

# Main setup flow
main() {
    check_requirements
    install_clis
    
    echo -e "\n${YELLOW}Select deployment platforms to set up:${NC}"
    echo "1) Vercel only (Frontend)"
    echo "2) Railway only (Backend)"
    echo "3) Both Vercel and Railway"
    echo "4) Skip platform setup"
    
    read -r -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            setup_vercel
            ;;
        2)
            setup_railway
            ;;
        3)
            setup_vercel
            setup_railway
            ;;
        4)
            echo "Skipping platform setup..."
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    create_secrets_list
    
    echo -e "\n${GREEN}🎉 Deployment setup complete!${NC}"
    echo -e "\nNext steps:"
    echo "1. Review and update environment files:"
    echo "   - frontend/.env.production"
    echo "   - backend/.env.production"
    echo "2. Add GitHub secrets as listed in infrastructure/GITHUB_SECRETS.md"
    echo "3. Commit and push to trigger deployment"
    echo -e "\nFor manual deployment:"
    echo "   Frontend: cd frontend && vercel --prod"
    echo "   Backend: cd backend && railway up"
}

# Run main function
main