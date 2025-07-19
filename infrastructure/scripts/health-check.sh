#!/bin/bash

# Health check script for production services

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
FRONTEND_URL="${FRONTEND_URL:-https://fides.vercel.app}"
BACKEND_URL="${BACKEND_URL:-https://fides-api.railway.app}"
TIMEOUT=10

echo "🏥 FIDES Health Check"
echo "===================="

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK ($response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED ($response)${NC}"
        return 1
    fi
}

# Check Frontend
echo -e "\n${YELLOW}Frontend Checks:${NC}"
check_endpoint "Homepage" "$FRONTEND_URL" 200
check_endpoint "Login Page" "$FRONTEND_URL/login" 200
check_endpoint "API Proxy" "$FRONTEND_URL/api/health" 200

# Check Backend
echo -e "\n${YELLOW}Backend Checks:${NC}"
check_endpoint "API Health" "$BACKEND_URL/api/health" 200
check_endpoint "API Docs" "$BACKEND_URL/api/docs" 200

# Check specific API endpoints
echo -e "\n${YELLOW}API Endpoint Checks:${NC}"
check_endpoint "Auth Endpoint" "$BACKEND_URL/api/auth/login" 405  # Should return Method Not Allowed for GET
check_endpoint "Users Endpoint" "$BACKEND_URL/api/users/mentors" 401  # Should return Unauthorized

# Performance check
echo -e "\n${YELLOW}Performance Check:${NC}"
start_time=$(date +%s%N)
curl -s -o /dev/null "$BACKEND_URL/api/health"
end_time=$(date +%s%N)
response_time=$(( ($end_time - $start_time) / 1000000 ))
echo "API Response Time: ${response_time}ms"

if [ $response_time -lt 500 ]; then
    echo -e "${GREEN}✅ Performance: Excellent${NC}"
elif [ $response_time -lt 1000 ]; then
    echo -e "${YELLOW}⚠️  Performance: Good${NC}"
else
    echo -e "${RED}❌ Performance: Needs attention${NC}"
fi

echo -e "\n✨ Health check complete!"