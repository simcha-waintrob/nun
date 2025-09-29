#!/bin/bash

echo "🔐 Creating Cognito User Pool (Simple Version)"
echo "=============================================="

REGION="us-west-2"

# Create basic user pool
echo "Creating user pool..."
USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "nun-pledges-users" \
    --region $REGION \
    --username-attributes email \
    --query 'UserPool.Id' \
    --output text)

echo "User Pool ID: $USER_POOL_ID"

# Create app client
echo "Creating app client..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-name "nun-pledges-web" \
    --region $REGION \
    --no-generate-secret \
    --query 'UserPoolClient.ClientId' \
    --output text)

echo "Client ID: $CLIENT_ID"

# Update config
echo "Updating configuration..."
sed -i '' "s/\"aws_user_pools_id\": \"PLACEHOLDER\"/\"aws_user_pools_id\": \"$USER_POOL_ID\"/" src/amplifyconfiguration.json
sed -i '' "s/\"aws_user_pools_web_client_id\": \"PLACEHOLDER\"/\"aws_user_pools_web_client_id\": \"$CLIENT_ID\"/" src/amplifyconfiguration.json

echo "✅ Done!"
echo "User Pool: $USER_POOL_ID"
echo "Client: $CLIENT_ID"
echo "Region: $REGION"
