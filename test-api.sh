#!/bin/bash

# API Test Script for Hostel Allotment System
echo "🧪 Testing Hostel Allotment System API..."
echo "========================================"

API_BASE="http://localhost:5000"
CLIENT_URL="http://localhost:5173"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    if curl -s -f -X "$method" "$API_BASE$endpoint" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Test if servers are running
echo "1. Checking if servers are running..."
if ! nc -z localhost 5000; then
    echo -e "${RED}❌ Backend server not running on port 5000${NC}"
    echo "   Run: cd Server && npm run dev"
    exit 1
fi

if ! nc -z localhost 5173; then
    echo -e "${YELLOW}⚠️  Frontend not running on port 5173${NC}"
    echo "   Run: cd Client && npm run dev"
fi

# Test API endpoints
echo -e "\n2. Testing API endpoints..."
test_endpoint "GET" "/health" "Health check"
test_endpoint "GET" "/api" "API info"
test_endpoint "GET" "/api/hostels" "Get hostels"
test_endpoint "GET" "/api/applications" "Get applications"
test_endpoint "GET" "/api/students" "Get students"

# Test CORS
echo -e "\n3. Testing CORS..."
curl -s -H "Origin: $CLIENT_URL" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS "$API_BASE/api/hostels" > /dev/null

if [ $? -eq 0 ]; then
    echo -e "CORS preflight... ${GREEN}✅ PASS${NC}"
else
    echo -e "CORS preflight... ${RED}❌ FAIL${NC}"
fi

echo -e "\n4. Testing database connection..."
response=$(curl -s "$API_BASE/health")
if echo "$response" | grep -q "ok"; then
    echo -e "Database connection... ${GREEN}✅ PASS${NC}"
else
    echo -e "Database connection... ${RED}❌ FAIL${NC}"
    echo "Response: $response"
fi

echo -e "\n📊 Test Summary:"
echo "=================="
echo "✅ If all tests pass, your data flow is working correctly!"
echo "❌ If tests fail, check the console logs and database connection"
echo ""
echo "🌐 Frontend: $CLIENT_URL"
echo "🔗 Backend:  $API_BASE"
echo "🔍 API Docs: $API_BASE/api"