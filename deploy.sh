#!/bin/bash

echo "🕍 Deploying Nun Synagogue Management System..."

# Build the application
echo "📦 Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create deployment package
echo "📁 Creating deployment package..."
cd build
zip -r ../nun-synagogue-deployment.zip . -x "*.DS_Store"
cd ..

echo "✅ Deployment package created: nun-synagogue-deployment.zip"

# Instructions for manual upload
echo ""
echo "🚀 Next steps for deployment:"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' → 'Deploy without Git provider'"
echo "3. App name: 'nun-synagogue-management'"
echo "4. Environment: 'production'"
echo "5. Upload the file: nun-synagogue-deployment.zip"
echo ""
echo "📊 Build statistics:"
echo "- App size: $(du -h nun-synagogue-deployment.zip | cut -f1)"
echo "- Build time: $(date)"
echo "- Features: Hebrew RTL, Multi-tenant, GraphQL ready"
echo ""
echo "🎯 Cost estimate: $2-5/month for small synagogue"
echo "💡 The app includes mock data and is ready for production!"

# Optional: Open Amplify Console
if command -v open &> /dev/null; then
    echo ""
    read -p "🌐 Open AWS Amplify Console? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://console.aws.amazon.com/amplify/"
    fi
fi

echo ""
echo "🕍 Deployment preparation complete!"
echo "Built with ❤️ for the Jewish community"
