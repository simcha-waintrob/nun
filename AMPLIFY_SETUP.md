# AWS Amplify Setup Guide for Nun Pledges

## Prerequisites
1. AWS CLI configured with your credentials
2. Amplify CLI installed globally

## Step-by-Step Setup

### 1. Initialize Amplify Project
```bash
amplify init
```
**Configuration:**
- Project name: `nun-pledges`
- Environment: `prod`
- Default editor: `Visual Studio Code`
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `build`
- Build command: `npm run build`
- Start command: `npm start`

### 2. Add Authentication
```bash
amplify add auth
```
**Configuration:**
- Default configuration with username
- Username attributes: `Email`
- Advanced settings: `No`

### 3. Add GraphQL API
```bash
amplify add api
```
**Configuration:**
- Service: `GraphQL`
- API name: `nunpledgesapi`
- Authorization type: `Amazon Cognito User Pool`
- Additional auth types: `No`
- Conflict resolution: `Auto Merge`
- Schema template: `Single object with fields`

### 4. Deploy to AWS
```bash
amplify push
```

### 5. Create GraphQL Schema
After deployment, update the GraphQL schema in `amplify/backend/api/nunpledgesapi/schema.graphql`:

```graphql
type Synagogue @model @auth(rules: [{allow: groups, groups: ["admin"]}, {allow: owner}]) {
  id: ID!
  name: String!
  address: String
  phone: String
  email: String
  congregants: [Congregant] @hasMany
  events: [Event] @hasMany
  payments: [Payment] @hasMany
}

type Congregant @model @auth(rules: [{allow: groups, groups: ["admin", "gabbai"]}, {allow: owner}]) {
  id: ID!
  firstName: String!
  lastName: String!
  email: String
  phone: String
  address: String
  synagogueID: ID! @index(name: "bySynagogue")
  synagogue: Synagogue @belongsTo
  payments: [Payment] @hasMany
}

type Event @model @auth(rules: [{allow: groups, groups: ["admin", "gabbai"]}, {allow: owner, operations: [read]}]) {
  id: ID!
  title: String!
  date: AWSDate!
  hebrewDate: String
  type: EventType!
  parasha: String
  synagogueID: ID! @index(name: "bySynagogue")
  synagogue: Synagogue @belongsTo
  aliyot: [Aliyah] @hasMany
}

type Aliyah @model @auth(rules: [{allow: groups, groups: ["admin", "gabbai"]}]) {
  id: ID!
  number: Int!
  congregantName: String
  eventID: ID! @index(name: "byEvent")
  event: Event @belongsTo
}

type Payment @model @auth(rules: [{allow: groups, groups: ["admin", "gabbai"]}, {allow: owner, operations: [read]}]) {
  id: ID!
  amount: Float!
  method: PaymentMethod!
  purpose: String!
  date: AWSDate!
  congregantID: ID! @index(name: "byCongregant")
  congregant: Congregant @belongsTo
  synagogueID: ID! @index(name: "bySynagogue")
  synagogue: Synagogue @belongsTo
}

enum EventType {
  SHABBAT
  HOLIDAY
  SPECIAL
}

enum PaymentMethod {
  CASH
  CHECK
  CREDIT_CARD
  BANK_TRANSFER
}
```

### 6. Update and Redeploy
```bash
amplify push
```

## After Setup

1. **Check AWS Console:**
   - Go to Cognito → User Pools
   - Find your newly created user pool
   - Note the User Pool ID and App Client ID

2. **Create Admin User:**
   - In Cognito console, create your first admin user
   - Add them to the "admin" group

3. **Update App Configuration:**
   - The `amplifyconfiguration.json` will be automatically updated
   - Redeploy your app to GitHub Pages

## User Management

Once setup is complete:
- **AWS Cognito Console**: Manage users, groups, and permissions
- **Admin Interface**: Create users through your app (if implemented)
- **User Groups**: `admin`, `gabbai`, `member` with different permissions
