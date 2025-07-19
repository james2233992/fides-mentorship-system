#!/bin/bash

# Master Deployment Script for FIDES Mentorship System
# This script orchestrates the complete deployment process

set -e

echo "🚀 FIDES Mentorship System - Deployment Script"
echo "============================================="
echo ""

# Check if .env.deployment exists
if [ ! -f ".env.deployment" ]; then
    echo "❌ Error: .env.deployment file not found!"
    echo "Please create .env.deployment with your deployment tokens."
    exit 1
fi

# Function to display menu
show_menu() {
    echo "Please select an option:"
    echo "1) Setup GitHub Secrets"
    echo "2) Deploy Frontend to Vercel"
    echo "3) Deploy Backend to Railway"
    echo "4) Full Deployment (Frontend + Backend)"
    echo "5) Initialize Railway Project (first time only)"
    echo "6) Check Deployment Status"
    echo "7) Exit"
}

# Function to check deployment status
check_status() {
    echo "🔍 Checking deployment status..."
    echo ""
    
    # Check Vercel
    echo "Frontend (Vercel):"
    if command -v vercel &> /dev/null; then
        cd frontend
        vercel ls 2>/dev/null || echo "  No Vercel deployments found or not logged in"
        cd ..
    else
        echo "  Vercel CLI not installed"
    fi
    echo ""
    
    # Check Railway
    echo "Backend (Railway):"
    if command -v railway &> /dev/null; then
        cd backend
        railway status 2>/dev/null || echo "  No Railway project linked or not logged in"
        cd ..
    else
        echo "  Railway CLI not installed"
    fi
    echo ""
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            echo "Setting up GitHub secrets..."
            ./scripts/setup-github-secrets.sh
            ;;
        2)
            echo "Deploying frontend to Vercel..."
            read -p "Deploy to production? (y/N): " prod
            if [[ $prod =~ ^[Yy]$ ]]; then
                ./scripts/deploy-vercel.sh production
            else
                ./scripts/deploy-vercel.sh
            fi
            ;;
        3)
            echo "Deploying backend to Railway..."
            ./scripts/deploy-railway.sh
            ;;
        4)
            echo "Starting full deployment..."
            echo "Step 1: Deploying frontend to Vercel..."
            ./scripts/deploy-vercel.sh production
            echo ""
            echo "Step 2: Deploying backend to Railway..."
            ./scripts/deploy-railway.sh
            echo ""
            echo "✅ Full deployment completed!"
            ;;
        5)
            echo "Initializing Railway project..."
            ./scripts/deploy-railway.sh init
            ;;
        6)
            check_status
            ;;
        7)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done