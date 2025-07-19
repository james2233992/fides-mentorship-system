#!/bin/bash

# Deployment Test Script
# Tests the deployed FIDES application

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 FIDES Deployment Test Suite${NC}"
echo "================================"
echo ""

# Get URLs from user
read -p "Enter your Railway backend URL (e.g., https://fides-backend.railway.app): " BACKEND_URL
read -p "Enter your Vercel frontend URL (e.g., https://fides-frontend.vercel.app): " FRONTEND_URL

# Remove trailing slashes
BACKEND_URL=${BACKEND_URL%/}
FRONTEND_URL=${FRONTEND_URL%/}

echo ""
echo -e "${BLUE}Testing Backend: ${BACKEND_URL}${NC}"
echo -e "${BLUE}Testing Frontend: ${FRONTEND_URL}${NC}"
echo ""

# Test results
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected, got $response)"
        ((FAILED++))
    fi
}

# Function to test POST endpoint
test_post() {
    local name=$1
    local url=$2
    local data=$3
    local expected=$4
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$data" || echo "000")
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected, got $response)"
        ((FAILED++))
    fi
}

echo -e "${YELLOW}1. Backend Health Checks${NC}"
echo "------------------------"
test_endpoint "API Health" "$BACKEND_URL/api/health" "200"
test_endpoint "API Root" "$BACKEND_URL/api" "200"
echo ""

echo -e "${YELLOW}2. Frontend Checks${NC}"
echo "------------------"
test_endpoint "Frontend Home" "$FRONTEND_URL" "200"
test_endpoint "Login Page" "$FRONTEND_URL/login" "200"
test_endpoint "Register Page" "$FRONTEND_URL/register" "200"
test_endpoint "Mentors Page" "$FRONTEND_URL/mentors" "200"
echo ""

echo -e "${YELLOW}3. API Endpoints${NC}"
echo "----------------"

# Test registration
TEST_EMAIL="test$(date +%s)@example.com"
REGISTER_DATA='{
    "email": "'$TEST_EMAIL'",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "mentee"
}'

test_post "User Registration" "$BACKEND_URL/api/auth/register" "$REGISTER_DATA" "201"

# Test login with wrong credentials (should fail)
LOGIN_DATA='{
    "email": "wrong@example.com",
    "password": "wrongpass"
}'
test_post "Login (Invalid)" "$BACKEND_URL/api/auth/login" "$LOGIN_DATA" "401"

echo ""

echo -e "${YELLOW}4. CORS Configuration${NC}"
echo "--------------------"
echo -n "Testing CORS headers... "

cors_response=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/health" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" || echo "FAILED")

if echo "$cors_response" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✓ PASSED${NC} (CORS enabled)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (CORS not configured)"
    ((FAILED++))
fi

echo ""

echo -e "${YELLOW}5. WebSocket Test${NC}"
echo "-----------------"
echo -n "Testing WebSocket endpoint... "

# Convert https to wss
WS_URL=$(echo "$BACKEND_URL" | sed 's/https:/wss:/g')

# Basic WebSocket test (just check if upgrade is possible)
ws_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Upgrade: websocket" \
    -H "Connection: Upgrade" \
    "$WS_URL/socket.io/" || echo "000")

if [ "$ws_response" = "400" ] || [ "$ws_response" = "426" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (WebSocket endpoint exists)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (WebSocket may need configuration)"
fi

echo ""
echo "================================"
echo -e "${BLUE}Test Summary${NC}"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your deployment is working correctly.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the logs above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Ensure Railway backend is fully deployed"
    echo "2. Check environment variables in both platforms"
    echo "3. Verify CORS_ORIGIN matches your Vercel URL"
    echo "4. Make sure database migrations have run"
fi

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Create a user account at $FRONTEND_URL/register"
echo "2. Test the full user flow"
echo "3. Monitor logs for any errors"
echo "4. Set up custom domains if needed"