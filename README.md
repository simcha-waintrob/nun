# Nun Pledges - מערכת ניהול רדרים ונדבות

A comprehensive synagogue management system for tracking pledges, donations, and payments with full Hebrew and RTL support, built for AWS Amplify deployment.

## Features

- **Multi-tenant Architecture**: Complete tenant isolation for multiple synagogues
- **Hebrew Calendar Integration**: Automatic Shabbat/Parasha generation using Hebcal
- **RTL Support**: Full Right-to-Left interface with Hebrew localization
- **Congregant Management**: Complete CRUD operations with family unit support
- **Event Management**: Shabbat, holidays, and custom events with aliyah assignments
- **Payment Tracking**: Multiple payment methods with allocation to specific charges
- **Advanced Reporting**: Annual reports with PDF/Excel export capabilities
- **AWS Amplify Ready**: Optimized for minimal-cost AWS deployment

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI with RTL theme
- **State Management**: React Context API
- **Calendar**: Hebcal for Hebrew calendar calculations
- **Authentication**: AWS Cognito (via Amplify)
- **Database**: AWS AppSync with GraphQL
- **Hosting**: AWS Amplify with automatic CI/CD
- **Routing**: React Router v6

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- AWS CLI configured
- Amplify CLI installed globally

### Local Development Setup

1. **Clone and install dependencies**:
```bash
cd nun-pledges
npm install
```

2. **Configure Amplify** (first time only):
```bash
amplify configure
amplify init
```

3. **Add backend services**:
```bash
amplify add auth
amplify add api
amplify push
```

4. **Start development server**:
```bash
npm start
```

The application will open at `http://localhost:3000` with Hebrew RTL interface.

### AWS Amplify Deployment

1. **Build for production**:
```bash
npm run build
```

2. **Deploy to Amplify**:
```bash
amplify publish
```

Or connect your GitHub repository to Amplify Console for automatic deployments.

## Core Modules

### 1. Dashboard
- Real-time statistics and KPIs
- Upcoming events and recent payments
- Multi-synagogue overview

### 2. Congregant Management
- Add/edit/delete congregants
- Family unit grouping
- Contact information and status tracking

### 3. Event Management
- Hebrew calendar event generation
- Aliyah assignments (7 required + 4 optional)
- Purchase/ritual tracking
- Pledge management (Kiddush, Seuda Shlishit)

### 4. Payment Management
- Multiple payment methods support
- Payment allocation to specific charges
- Outstanding balance tracking
- Automatic Hebrew date conversion

### 5. Reports & Analytics
- Individual annual reports
- Summary reports for Gabbaim
- PDF/Excel export capabilities
- Hebrew date formatting

## Data Model

The system uses a multi-tenant GraphQL schema with the following key entities:

- **Synagogue**: Tenant isolation
- **User**: Authentication and roles
- **Congregant**: Member management
- **HebrewYear**: Calendar year boundaries
- **Event**: Shabbat, holidays, custom events
- **Aliyah**: Torah reading assignments
- **Purchase**: Ritual purchases
- **Pledge**: Commitments (Kiddush, etc.)
- **Payment**: Financial transactions
- **PaymentAllocation**: Payment-to-charge mapping

## Security Features

- **AWS Cognito Authentication**: Secure user management
- **Role-based Access Control**: SYSTEM_ADMIN, GABBAI_ADMIN, READ_ONLY
- **Tenant Isolation**: Complete data separation between synagogues
- **Input Validation**: Client and server-side validation
- **Audit Trail**: All operations logged

## AWS Cost Optimization

The application is designed for minimal AWS costs:

- **Amplify Hosting**: Pay-per-use with generous free tier
- **AppSync**: GraphQL API with request-based pricing
- **Cognito**: User authentication with free tier up to 50,000 MAUs
- **DynamoDB**: Serverless database with on-demand pricing
- **Lambda**: Serverless functions for business logic

Estimated monthly cost for small synagogue (< 200 members): **$5-15/month**

## Hebrew Calendar Features

- Automatic Hebrew year creation with proper date boundaries
- Shabbat and Parasha event generation using Hebcal
- Hebrew date string storage alongside Gregorian dates
- Holiday detection and integration
- Israel calendar support

## Mobile Support

- Responsive design for tablets and phones
- Touch-friendly interface
- Offline-capable PWA features (planned)

## Development Scripts

```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
amplify push       # Deploy backend changes
amplify publish    # Full deployment
```

## Environment Setup

Create `.env.local` file for local development:

```env
REACT_APP_AWS_REGION=il-central-1
REACT_APP_ENVIRONMENT=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper Hebrew RTL support
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Contact the development team

## Roadmap

- [ ] SMS/WhatsApp integration for notifications
- [ ] Advanced reporting dashboard
- [ ] Mobile app (React Native)
- [ ] Bank integration for automatic payment matching
- [ ] Multi-language support beyond Hebrew/English
- [ ] Advanced analytics and insights

---

**Built with ❤️ for the Jewish community**
