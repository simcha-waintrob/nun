#!/bin/bash

echo "🚀 Deploying to AWS Amplify via Git"
echo "=================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Initializing..."
    git init
    git remote add origin https://github.com/simcha-w/NUN.git
fi

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to AWS Amplify - $(date)"

# Push to main branch (this will trigger Amplify deployment)
echo "☁️ Pushing to GitHub (this will trigger Amplify deployment)..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
    echo "🔗 AWS Amplify will automatically deploy from GitHub"
    echo "🔗 Your app will be available at: https://main.d18c57w6641c15.amplifyapp.com/"
    echo "⏳ Deployment may take a few minutes to complete"
    echo "📊 Monitor deployment at: https://us-west-2.console.aws.amazon.com/amplify/home?region=us-west-2#/d18c57w6641c15"
else
    echo "❌ Git push failed"
    exit 1
fi
