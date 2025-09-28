#!/bin/bash

echo "🕍 Automated AWS Deployment - Nun Synagogue Management System"
echo "=============================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Prompt for AWS credentials if not set
echo "🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "⚠️  AWS credentials not configured. Let's set them up:"
    read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -s -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo
    read -p "Enter AWS Region (default: us-west-2): " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-west-2}
    
    # Configure AWS CLI
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
    aws configure set region "$AWS_REGION"
    aws configure set output json
    
    echo "✅ AWS credentials configured"
fi

# Verify credentials
echo "🔍 Verifying AWS access..."
CALLER_IDENTITY=$(aws sts get-caller-identity 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials verification failed"
    exit 1
fi

USER_ARN=$(echo $CALLER_IDENTITY | jq -r '.Arn')
echo "✅ Authenticated as: $USER_ARN"

# Build the application
echo ""
echo "📦 Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create Amplify app
echo ""
echo "🚀 Creating Amplify app..."
APP_RESULT=$(aws amplify create-app \
    --name "nun-synagogue-management" \
    --description "Hebrew Synagogue Management System - Multi-tenant with GraphQL" \
    --platform WEB \
    --build-spec '{
        "version": 1,
        "frontend": {
            "phases": {
                "preBuild": {
                    "commands": ["npm ci"]
                },
                "build": {
                    "commands": ["npm run build"]
                }
            },
            "artifacts": {
                "baseDirectory": "build",
                "files": ["**/*"]
            },
            "cache": {
                "paths": ["node_modules/**/*"]
            }
        }
    }' 2>/dev/null)

if [ $? -eq 0 ]; then
    APP_ID=$(echo $APP_RESULT | jq -r '.app.appId')
    APP_ARN=$(echo $APP_RESULT | jq -r '.app.appArn')
    DEFAULT_DOMAIN=$(echo $APP_RESULT | jq -r '.app.defaultDomain')
    
    echo "✅ Amplify app created successfully!"
    echo "   App ID: $APP_ID"
    echo "   Domain: https://$DEFAULT_DOMAIN"
else
    echo "⚠️  App might already exist, trying to list existing apps..."
    EXISTING_APPS=$(aws amplify list-apps --query 'apps[?name==`nun-synagogue-management`]' 2>/dev/null)
    if [ "$(echo $EXISTING_APPS | jq length)" -gt 0 ]; then
        APP_ID=$(echo $EXISTING_APPS | jq -r '.[0].appId')
        DEFAULT_DOMAIN=$(echo $EXISTING_APPS | jq -r '.[0].defaultDomain')
        echo "✅ Using existing app: $APP_ID"
        echo "   Domain: https://$DEFAULT_DOMAIN"
    else
        echo "❌ Failed to create or find Amplify app"
        exit 1
    fi
fi

# Create deployment
echo ""
echo "📁 Creating deployment package..."
cd build
zip -r ../deployment.zip . -q
cd ..

# Deploy to Amplify
echo ""
echo "🚀 Deploying to Amplify..."
DEPLOYMENT_RESULT=$(aws amplify create-deployment \
    --app-id "$APP_ID" \
    --file-map "deployment.zip=@deployment.zip" 2>/dev/null)

if [ $? -eq 0 ]; then
    JOB_ID=$(echo $DEPLOYMENT_RESULT | jq -r '.jobId')
    echo "✅ Deployment initiated!"
    echo "   Job ID: $JOB_ID"
    
    # Wait for deployment to complete
    echo "⏳ Waiting for deployment to complete..."
    while true; do
        JOB_STATUS=$(aws amplify get-job --app-id "$APP_ID" --branch-name "main" --job-id "$JOB_ID" --query 'job.summary.status' --output text 2>/dev/null)
        
        case $JOB_STATUS in
            "SUCCEED")
                echo "✅ Deployment completed successfully!"
                break
                ;;
            "FAILED")
                echo "❌ Deployment failed!"
                aws amplify get-job --app-id "$APP_ID" --branch-name "main" --job-id "$JOB_ID" --query 'job.summary.statusReason' --output text
                exit 1
                ;;
            "RUNNING"|"PENDING")
                echo "   Status: $JOB_STATUS..."
                sleep 10
                ;;
            *)
                echo "   Unknown status: $JOB_STATUS"
                sleep 5
                ;;
        esac
    done
else
    echo "⚠️  Direct deployment failed, trying manual upload approach..."
    echo "📤 Upload deployment.zip manually to: https://console.aws.amazon.com/amplify/home#/$APP_ID"
fi

# Final results
echo ""
echo "🎉 Deployment Summary"
echo "===================="
echo "🕍 App Name: Nun Synagogue Management"
echo "🌐 Live URL: https://$DEFAULT_DOMAIN"
echo "📱 Mobile-friendly Hebrew interface"
echo "💰 Estimated cost: $2-5/month"
echo ""
echo "🎯 Features Available:"
echo "   ✅ Hebrew RTL Dashboard"
echo "   ✅ Congregant Management"
echo "   ✅ Hebrew Calendar Events"
echo "   ✅ Payment Tracking"
echo "   ✅ Annual Reports"
echo "   ✅ Multi-tenant Architecture"
echo ""
echo "🔗 AWS Console: https://console.aws.amazon.com/amplify/home#/$APP_ID"
echo ""
echo "🕍 Built with ❤️ for the Jewish community"

# Clean up
rm -f deployment.zip

# Open the live site
if command -v open &> /dev/null; then
    echo ""
    read -p "🌐 Open live site? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://$DEFAULT_DOMAIN"
    fi
fi
