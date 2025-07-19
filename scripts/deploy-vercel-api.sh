#!/bin/bash

# Vercel API Deployment Script
# This script helps deploy the frontend to Vercel

set -e

echo "▲ Vercel Frontend Deployment Helper"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f ".env.deployment" ]; then
    export $(cat .env.deployment | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Error: .env.deployment file not found!${NC}"
    exit 1
fi

# Check if we're in the frontend directory
cd frontend

echo -e "${BLUE}📦 Installing Vercel CLI locally...${NC}"
npm install --save-dev vercel

echo -e "${BLUE}🔧 Creating deployment configuration...${NC}"

# Create a deployment script
cat > deploy-now.js << 'EOF'
const { execSync } = require('child_process');
const fs = require('fs');

const token = process.env.VERCEL_TOKEN;
const projectName = 'fides-frontend';

console.log('🚀 Starting Vercel deployment...\n');

// Create vercel.json with environment variables
const vercelConfig = {
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://fides-backend-production.up.railway.app",
    "NEXT_PUBLIC_WS_URL": "wss://fides-backend-production.up.railway.app",
    "NEXT_PUBLIC_APP_NAME": "FIDES Mentorship"
  }
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

try {
  // Deploy to Vercel
  console.log('📤 Deploying to Vercel...\n');
  const deployCommand = `npx vercel --token=${token} --name=${projectName} --yes --prod`;
  
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log('\n✅ Deployment initiated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Check your Vercel dashboard for deployment status');
  console.log('2. Once deployed, update NEXT_PUBLIC_API_URL with your Railway backend URL');
  console.log('3. Redeploy if needed after updating environment variables');
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n💡 Alternative: Deploy manually via https://vercel.com/new');
}
EOF

echo -e "${GREEN}✅ Deployment script created!${NC}"
echo ""
echo -e "${YELLOW}📋 To deploy your frontend:${NC}"
echo ""
echo "1. First, get your Railway backend URL (deploy backend first)"
echo ""
echo "2. Update the API URL in the script above if needed"
echo ""
echo "3. Run the deployment:"
echo -e "   ${BLUE}cd frontend && node deploy-now.js${NC}"
echo ""
echo "4. Or deploy manually:"
echo "   - Go to https://vercel.com/new"
echo "   - Import: james2233992/fides-mentorship-system"
echo "   - Root Directory: frontend"
echo "   - Add environment variables"
echo ""
echo -e "${GREEN}📌 Important URLs:${NC}"
echo "   - Vercel Dashboard: https://vercel.com/james2233992s-projects"
echo "   - GitHub Repo: https://github.com/james2233992/fides-mentorship-system"