#!/bin/bash

echo "🔐 Creating AWS Cognito User Pool for Nun Pledges"
echo "================================================"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first"
    exit 1
fi

echo "✅ AWS CLI configured"

# Get AWS region - you can change this to your preferred region
# Common options: us-east-1, us-west-2, eu-west-1, il-central-1
REGION="${AWS_REGION:-us-west-2}"
echo "📍 Using region: $REGION"

# Create User Pool
echo "👥 Creating Cognito User Pool..."
USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "nun-pledges-users" \
    --region $REGION \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": false,
            "RequireLowercase": false,
            "RequireNumbers": false,
            "RequireSymbols": false
        }
    }' \
    --username-attributes "email" \
    --auto-verified-attributes "email" \
    --verification-message-template '{
        "DefaultEmailOption": "CONFIRM_WITH_CODE",
        "EmailSubject": "ברוכים הבאים למערכת נון - אימות חשבון",
        "EmailMessage": "קוד האימות שלך הוא: {####}"
    }' \
    --admin-create-user-config '{
        "AllowAdminCreateUserOnly": true,
        "InviteMessageTemplate": {
            "EmailSubject": "הזמנה למערכת ניהול נדרים ונדבות",
            "EmailMessage": "שלום! הוזמנת להצטרף למערכת ניהול נדרים ונדבות. שם המשתמש שלך: {username} וסיסמה זמנית: {####}"
        }
    }' \
    --query 'UserPool.Id' \
    --output text)

if [ -z "$USER_POOL_ID" ]; then
    echo "❌ Failed to create user pool"
    exit 1
fi

echo "✅ User Pool created: $USER_POOL_ID"

# Create User Pool Client
echo "📱 Creating User Pool Client..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-name "nun-pledges-web-client" \
    --region $REGION \
    --generate-secret false \
    --explicit-auth-flows "ADMIN_NO_SRP_AUTH" "USER_PASSWORD_AUTH" "ALLOW_USER_SRP_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
    --supported-identity-providers "COGNITO" \
    --query 'UserPoolClient.ClientId' \
    --output text)

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Failed to create user pool client"
    exit 1
fi

echo "✅ User Pool Client created: $CLIENT_ID"

# Create Identity Pool
echo "🆔 Creating Identity Pool..."
IDENTITY_POOL_ID=$(aws cognito-identity create-identity-pool \
    --identity-pool-name "nun_pledges_identity_pool" \
    --region $REGION \
    --allow-unauthenticated-identities false \
    --cognito-identity-providers "ProviderName=cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID,ClientId=$CLIENT_ID" \
    --query 'IdentityPoolId' \
    --output text)

if [ -z "$IDENTITY_POOL_ID" ]; then
    echo "❌ Failed to create identity pool"
    exit 1
fi

echo "✅ Identity Pool created: $IDENTITY_POOL_ID"

# Create User Groups
echo "👑 Creating user groups..."
aws cognito-idp create-group \
    --group-name "admin" \
    --user-pool-id $USER_POOL_ID \
    --description "מנהלי מערכת" \
    --region $REGION

aws cognito-idp create-group \
    --group-name "gabbai" \
    --user-pool-id $USER_POOL_ID \
    --description "גבאים" \
    --region $REGION

aws cognito-idp create-group \
    --group-name "member" \
    --user-pool-id $USER_POOL_ID \
    --description "חברי קהילה" \
    --region $REGION

echo "✅ User groups created"

# Update amplify configuration
echo "⚙️ Updating Amplify configuration..."
cat > src/amplifyconfiguration.json << EOF
{
  "aws_project_region": "$REGION",
  "aws_cognito_identity_pool_id": "$IDENTITY_POOL_ID",
  "aws_cognito_region": "$REGION",
  "aws_user_pools_id": "$USER_POOL_ID",
  "aws_user_pools_web_client_id": "$CLIENT_ID",
  "oauth": {},
  "aws_cognito_username_attributes": ["email"],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": ["email"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": ["SMS"],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": ["email"],
  "aws_appsync_graphqlEndpoint": "PLACEHOLDER",
  "aws_appsync_region": "$REGION",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  "aws_appsync_apiKey": "PLACEHOLDER"
}
EOF

echo "✅ Configuration updated"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Identity Pool ID: $IDENTITY_POOL_ID"
echo "Region: $REGION"
echo ""
echo "📋 Next Steps:"
echo "1. Go to AWS Cognito Console: https://console.aws.amazon.com/cognito/"
echo "2. Select your region: $REGION"
echo "3. Click on 'nun-pledges-users' user pool"
echo "4. Create your first admin user in the 'Users' tab"
echo "5. Add the user to the 'admin' group"
echo "6. Rebuild and redeploy your app"
echo ""
echo "🔗 Direct link to your User Pool:"
echo "https://$REGION.console.aws.amazon.com/cognito/v2/idp/user-pools/$USER_POOL_ID/users"
