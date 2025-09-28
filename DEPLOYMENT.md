# Deployment Guide - Nun Pledges

## AWS Amplify Deployment for Minimal Cost

This guide will help you deploy the Nun Pledges synagogue management system to AWS Amplify with minimal cost optimization.

## Prerequisites

1. **AWS Account** with billing set up
2. **AWS CLI** installed and configured
3. **Amplify CLI** installed globally: `npm install -g @aws-amplify/cli`
4. **GitHub account** (for automatic deployments)

## Step 1: Initialize Amplify Project

```bash
cd nun-pledges
amplify configure
```

Follow the prompts to:
- Sign in to AWS Console
- Create IAM user with appropriate permissions
- Set up access keys locally

## Step 2: Initialize the Amplify Project

```bash
amplify init
```

Configuration options:
- Project name: `nun-pledges`
- Environment name: `dev`
- Default editor: Your preferred editor
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Build directory: `build`
- Build command: `npm run build`
- Start command: `npm start`

## Step 3: Add Authentication (Cognito)

```bash
amplify add auth
```

Choose:
- Default configuration
- Username (email as username)
- No advanced settings for MVP

## Step 4: Add API (AppSync + DynamoDB)

```bash
amplify add api
```

Choose:
- GraphQL
- Authorization type: Amazon Cognito User Pool
- Use existing schema: No
- Guided schema creation: No
- Edit schema now: Yes

Replace the generated schema with the one in `amplify/backend/api/nunpledges/schema.graphql`

## Step 5: Deploy Backend

```bash
amplify push
```

This will:
- Create Cognito User Pool
- Create AppSync GraphQL API
- Create DynamoDB tables
- Generate GraphQL operations

## Step 6: Update Configuration

After `amplify push`, update `src/amplifyconfiguration.json` with the generated values.

## Step 7: Deploy to Amplify Console

### Option A: Manual Deployment

```bash
amplify publish
```

### Option B: Continuous Deployment (Recommended)

1. Push code to GitHub repository
2. Go to AWS Amplify Console
3. Connect repository
4. Configure build settings:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Cost Optimization Settings

### 1. DynamoDB On-Demand Pricing
- Automatically scales with usage
- No minimum costs
- Pay only for read/write requests

### 2. AppSync Request-Based Pricing
- $4.00 per million requests
- Real-time subscriptions: $2.00 per million connection minutes

### 3. Cognito Free Tier
- 50,000 MAUs (Monthly Active Users) free
- Additional users: $0.0055 per MAU

### 4. Amplify Hosting
- Free tier: 1,000 build minutes/month
- Storage: $0.023 per GB per month
- Data transfer: $0.15 per GB

### 5. Lambda Functions (if used)
- 1M free requests per month
- 400,000 GB-seconds compute time free

## Expected Monthly Costs

For a small synagogue (< 200 members):

| Service | Usage | Cost |
|---------|--------|------|
| Amplify Hosting | < 1GB storage, < 5GB transfer | $0.50 |
| DynamoDB | < 1M reads, < 100K writes | $1.00 |
| AppSync | < 100K requests | $0.40 |
| Cognito | < 50 active users | Free |
| Lambda | < 10K invocations | Free |
| **Total** | | **~$2-5/month** |

## Environment Variables

Create `.env.local` for local development:

```env
REACT_APP_AWS_REGION=il-central-1
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=false
```

## Production Optimizations

### 1. Enable Compression
In Amplify Console → App Settings → Rewrites and redirects:
```
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
Condition: Accept: text/html
```

### 2. Set Cache Headers
```
Source: /static/css/<*>
Target: /static/css/<*>
Type: 200 (Rewrite)
Headers: Cache-Control: public,max-age=31536000,immutable
```

### 3. Enable Branch Protection
- Protect main branch
- Require pull request reviews
- Enable automatic deployments for staging

## Monitoring and Alerts

### 1. Set up AWS Budgets
```bash
aws budgets create-budget --account-id YOUR_ACCOUNT_ID --budget file://budget.json
```

### 2. CloudWatch Alarms
- DynamoDB throttling
- AppSync error rates
- Amplify build failures

## Security Best Practices

### 1. IAM Roles
- Principle of least privilege
- Separate roles for different environments
- Regular access reviews

### 2. Cognito Settings
- Enable MFA for admin users
- Set password policies
- Configure account recovery

### 3. API Security
- Enable request validation
- Set up rate limiting
- Monitor for suspicious activity

## Backup and Recovery

### 1. DynamoDB Backups
- Enable point-in-time recovery
- Schedule daily backups
- Test restore procedures

### 2. Code Backups
- GitHub repository
- Multiple branches for environments
- Regular dependency updates

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs in Amplify Console

2. **Authentication Issues**
   - Verify Cognito configuration
   - Check user pool settings
   - Validate JWT tokens

3. **API Errors**
   - Check AppSync schema
   - Verify resolver mappings
   - Review CloudWatch logs

### Support Resources

- AWS Amplify Documentation
- AWS Support (if subscribed)
- Community forums
- GitHub issues

## Next Steps

1. Set up staging environment
2. Configure custom domain
3. Add SSL certificate
4. Set up monitoring dashboards
5. Plan for scaling

---

**Remember**: Always test in a development environment before deploying to production!
