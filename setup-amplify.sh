#!/bin/bash

echo "🚀 Setting up AWS Amplify for Nun Pledges System"
echo "================================================"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first"
    exit 1
fi

echo "✅ AWS CLI configured"

# Initialize Amplify project
echo "📦 Initializing Amplify project..."
amplify init --yes \
    --appId "nun-pledges" \
    --envName "prod" \
    --defaultEditor "code" \
    --frontend "javascript" \
    --framework "react" \
    --srcDir "src" \
    --distDir "build" \
    --buildCommand "npm run build" \
    --startCommand "npm start"

# Add authentication
echo "🔐 Adding Cognito authentication..."
amplify add auth --yes \
    --resourceName "nunpledgesauth" \
    --userPoolName "nun-pledges-users" \
    --usernameAttributes "email" \
    --userPoolGroups "admin,gabbai,member" \
    --adminQueries true \
    --triggers "{\"CreateAuthChallenge\":[],\"CustomMessage\":[],\"DefineAuthChallenge\":[],\"PostAuthentication\":[],\"PostConfirmation\":[],\"PreAuthentication\":[],\"PreSignUp\":[],\"VerifyAuthChallengeResponse\":[]}"

# Add GraphQL API
echo "📊 Adding GraphQL API..."
amplify add api --yes \
    --apiName "nunpledgesapi" \
    --apiType "graphql" \
    --authType "AMAZON_COGNITO_USER_POOLS" \
    --conflictResolution "AUTOMERGE"

# Push to AWS
echo "☁️ Deploying to AWS..."
amplify push --yes

echo "✅ Setup complete!"
echo "📋 Next steps:"
echo "1. Check AWS Cognito console for your user pool"
echo "2. Create your first admin user"
echo "3. Update your app and redeploy"
