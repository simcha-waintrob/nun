#!/bin/bash

# Nun Pledges - Development Setup Script

echo "🕍 Setting up Nun Pledges Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "🔧 Installing Amplify CLI..."
    npm install -g @aws-amplify/cli
else
    echo "✅ Amplify CLI is installed: $(amplify --version)"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating .env.local file..."
    cat > .env.local << EOF
REACT_APP_AWS_REGION=il-central-1
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=false
EOF
    echo "✅ Created .env.local file"
else
    echo "✅ .env.local file already exists"
fi

# Check AWS CLI configuration
if ! command -v aws &> /dev/null; then
    echo "⚠️ AWS CLI is not installed. You'll need it for Amplify deployment."
    echo "   Install it from: https://aws.amazon.com/cli/"
else
    echo "✅ AWS CLI is installed: $(aws --version)"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Initialize Amplify: amplify init"
echo "3. Add authentication: amplify add auth"
echo "4. Add API: amplify add api"
echo "5. Deploy backend: amplify push"
echo "6. Start development server: npm start"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🕍 Happy coding! - Built with ❤️ for the Jewish community"
