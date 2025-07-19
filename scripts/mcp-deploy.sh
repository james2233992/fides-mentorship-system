#!/bin/bash

# MCP Deployment Helper Script
# This script helps with MCP server deployment operations

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
MCP_SERVER_DIR="$PROJECT_ROOT/mcp-servers/deployment-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FIDES MCP Deployment Helper${NC}"
echo "================================="

# Function to check if MCP server is built
check_mcp_built() {
    if [ ! -d "$MCP_SERVER_DIR/dist" ]; then
        echo -e "${YELLOW}MCP server not built. Building now...${NC}"
        cd "$MCP_SERVER_DIR"
        npm install
        npm run build
        cd "$PROJECT_ROOT"
        echo -e "${GREEN}✓ MCP server built successfully${NC}"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build       - Build the MCP deployment server"
    echo "  test        - Test MCP server connectivity"
    echo "  deploy-all  - Deploy both frontend and backend"
    echo "  status      - Check deployment status"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 deploy-all"
    echo "  $0 status"
}

# Main script logic
case "${1:-help}" in
    build)
        echo -e "${BLUE}Building MCP deployment server...${NC}"
        cd "$MCP_SERVER_DIR"
        npm install
        npm run build
        echo -e "${GREEN}✓ MCP server built successfully${NC}"
        ;;
        
    test)
        check_mcp_built
        echo -e "${BLUE}Testing MCP server...${NC}"
        cd "$MCP_SERVER_DIR"
        # Start the server in background for testing
        npm start &
        SERVER_PID=$!
        sleep 3
        
        # Check if server is running
        if ps -p $SERVER_PID > /dev/null; then
            echo -e "${GREEN}✓ MCP server is running${NC}"
            kill $SERVER_PID
        else
            echo -e "${RED}✗ MCP server failed to start${NC}"
            exit 1
        fi
        ;;
        
    deploy-all)
        check_mcp_built
        echo -e "${BLUE}Starting full deployment via MCP...${NC}"
        echo ""
        echo "This will:"
        echo "1. Run production checks"
        echo "2. Deploy frontend to Vercel"
        echo "3. Deploy backend to Railway"
        echo "4. Create a GitHub release"
        echo ""
        read -p "Continue? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Starting deployment process...${NC}"
            echo "Please use Claude Code with the MCP server to execute the deployment"
            echo ""
            echo "Example commands to use in Claude Code:"
            echo "- Run production checks with the deployment MCP server"
            echo "- Deploy frontend to production using the deployment server"
            echo "- Deploy backend to Railway with migrations"
            echo "- Create a GitHub release for version v1.0.0"
        else
            echo "Deployment cancelled"
        fi
        ;;
        
    status)
        check_mcp_built
        echo -e "${BLUE}Checking deployment status...${NC}"
        echo ""
        echo "To check status, use Claude Code with:"
        echo "- Check deployment status for all platforms using the MCP server"
        ;;
        
    help|*)
        show_usage
        ;;
esac

echo ""
echo -e "${BLUE}MCP Server Configuration:${NC}"
echo "- Config file: $PROJECT_ROOT/.claude/mcp-settings.json"
echo "- Server location: $MCP_SERVER_DIR"
echo "- Tokens file: $PROJECT_ROOT/.env.deployment"