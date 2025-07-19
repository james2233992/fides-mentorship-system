#!/bin/bash

# Railway API Deployment Script
# This script deploys the backend to Railway using their API

set -e

echo "🚂 Railway Backend Deployment Script"
echo "===================================="

# Load environment variables
if [ -f ".env.deployment" ]; then
    export $(cat .env.deployment | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.deployment file not found!"
    exit 1
fi

# Check if Railway token is set
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Error: RAILWAY_TOKEN not found!"
    exit 1
fi

# Railway GraphQL API endpoint
RAILWAY_API="https://api.railway.app/graphql/v2"

echo "📦 Creating Railway project..."

# Create project
PROJECT_CREATE_MUTATION='mutation {
  projectCreate(
    input: {
      name: "fides-backend"
      description: "FIDES Mentorship System Backend"
      isPublic: false
      repo: {
        fullRepoName: "james2233992/fides-mentorship-system"
        branch: "main"
      }
    }
  ) {
    id
    name
  }
}'

PROJECT_RESPONSE=$(curl -s -X POST $RAILWAY_API \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"$(echo $PROJECT_CREATE_MUTATION | tr -d '\n')\"}")

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error creating project. Response: $PROJECT_RESPONSE"
    echo "Please create the project manually at https://railway.app"
    exit 1
fi

echo "✅ Project created with ID: $PROJECT_ID"

# Create environment variables
echo "🔧 Setting environment variables..."

ENV_VARS='{
  "NODE_ENV": "production",
  "PORT": "3000",
  "JWT_SECRET": "'$(openssl rand -base64 32)'",
  "JWT_EXPIRES_IN": "7d",
  "CORS_ORIGIN": "https://fides-frontend.vercel.app",
  "FRONTEND_URL": "https://fides-frontend.vercel.app",
  "SENDGRID_API_KEY": "your-sendgrid-key",
  "EMAIL_FROM": "noreply@fides.com",
  "TWILIO_ACCOUNT_SID": "your-twilio-sid",
  "TWILIO_AUTH_TOKEN": "your-twilio-auth",
  "TWILIO_PHONE_NUMBER": "+1234567890"
}'

# Note: The actual API calls for services and deployments are complex
# For now, we'll provide instructions for manual completion

echo ""
echo "📋 Next Steps (Manual via Railway Dashboard):"
echo ""
echo "1. Go to: https://railway.app/project/$PROJECT_ID"
echo ""
echo "2. In the Railway dashboard:"
echo "   a) Click 'New' → 'Database' → 'Add PostgreSQL'"
echo "   b) Click 'New' → 'Database' → 'Add Redis'"
echo ""
echo "3. Click on your 'fides-backend' service"
echo ""
echo "4. Go to 'Variables' tab and add these:"
echo "$ENV_VARS" | jq .
echo ""
echo "5. Go to 'Settings' tab:"
echo "   - Set Root Directory: /backend"
echo "   - Set Start Command: npm run start:prod"
echo "   - Click 'Generate Domain' to get your public URL"
echo ""
echo "6. Deploy will start automatically"
echo ""
echo "7. After deployment, run migrations:"
echo "   railway run npm run prisma:migrate:deploy"
echo ""
echo "8. Your backend URL will be something like:"
echo "   https://fides-backend-production-xxxx.up.railway.app"
echo ""
echo "Save this URL for the frontend deployment!"