#!/bin/bash

echo "🚀 Direct Deployment to Amplify"
echo "==============================="

APP_ID="d3apqb24ywlrck"

# Create a deployment using AWS CLI
echo "📦 Creating deployment..."

# Convert zip to base64 for API upload
echo "🔄 Preparing deployment package..."
BASE64_ZIP=$(base64 -i nun-synagogue-fixed.zip)

# Create deployment via API
echo "📤 Starting deployment job..."
JOB_RESULT=$(aws amplify start-job \
    --app-id "$APP_ID" \
    --branch-name "main" \
    --job-type "MANUAL" \
    --job-reason "Direct deployment of Hebrew Synagogue Management System")

if [ $? -eq 0 ]; then
    JOB_ID=$(echo $JOB_RESULT | jq -r '.jobSummary.jobId')
    echo "✅ Deployment job started: $JOB_ID"
    
    # Monitor deployment
    echo "⏳ Monitoring deployment progress..."
    while true; do
        JOB_STATUS=$(aws amplify get-job --app-id "$APP_ID" --branch-name "main" --job-id "$JOB_ID" --query 'job.summary.status' --output text)
        
        case $JOB_STATUS in
            "SUCCEED")
                echo "✅ Deployment completed successfully!"
                echo "🌐 Site is now live at: https://$APP_ID.amplifyapp.com"
                break
                ;;
            "FAILED")
                echo "❌ Deployment failed!"
                aws amplify get-job --app-id "$APP_ID" --branch-name "main" --job-id "$JOB_ID" --query 'job.summary.statusReason' --output text
                break
                ;;
            "RUNNING"|"PENDING")
                echo "   Status: $JOB_STATUS..."
                sleep 5
                ;;
            *)
                echo "   Unknown status: $JOB_STATUS"
                sleep 3
                ;;
        esac
    done
else
    echo "❌ Failed to start deployment job"
    echo ""
    echo "📋 Manual Steps Required:"
    echo "1. Go to: https://console.aws.amazon.com/amplify/home#/$APP_ID"
    echo "2. Click on 'main' branch"
    echo "3. Click 'Deploy updates'"
    echo "4. Upload: nun-synagogue-fixed.zip"
    echo ""
    echo "🎯 After upload, the Hebrew synagogue management system will be live!"
fi

echo ""
echo "🕍 Hebrew Synagogue Management System"
echo "📱 Features: Dashboard, Congregants, Events, Payments, Reports"
echo "💰 Cost: ~$2-5/month for small synagogue"
