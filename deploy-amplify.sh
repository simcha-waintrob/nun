#!/bin/bash

echo "🚀 Deploying to AWS Amplify"
echo "=========================="

APP_ID="d18c57w6641c15"
BRANCH_NAME="main"

# Build the app
echo "📦 Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Create deployment package
echo "📁 Creating deployment package..."
cd build
zip -r ../amplify-deployment.zip . -x "*.DS_Store*"
cd ..

echo "✅ Deployment package created"

# Deploy to Amplify
echo "☁️ Deploying to AWS Amplify..."
aws amplify start-deployment \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --source-url "file://$(pwd)/amplify-deployment.zip" \
    --region us-west-2

if [ $? -eq 0 ]; then
    echo "✅ Deployment initiated successfully!"
    echo "🔗 Your app will be available at: https://$BRANCH_NAME.$APP_ID.amplifyapp.com/"
    echo "⏳ Deployment may take a few minutes to complete"
else
    echo "❌ Deployment failed"
    exit 1
fi

# Clean up
rm -f amplify-deployment.zip
echo "🧹 Cleanup completed"
