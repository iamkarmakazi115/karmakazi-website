#!/bin/bash

# Git Deployment Script for Karmakazi Website
# Usage: ./deploy.sh

echo "===================="
echo "Karmakazi Git Deploy"
echo "===================="
echo

# Check git status before changes
echo "📋 Current Git Status:"
git status
echo

# Add all changes
echo "➕ Adding all changes..."
git add .
echo

# Show status after adding
echo "📋 Git Status After Add:"
git status
echo

# Commit with message
echo "💾 Committing changes..."
git commit -m "script updates"
echo

# Show recent commit history
echo "📜 Recent Commit History:"
git log --oneline -n 5
echo

# Push to main branch
echo "🚀 Pushing to origin main..."
git push origin main
echo

# Final status check
echo "✅ Final Git Status:"
git status
echo

echo "===================="
echo "Deployment Complete!"
echo "===================="