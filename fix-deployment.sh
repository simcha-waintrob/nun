#!/bin/bash

echo "🔧 Fixing Amplify Deployment - Nun Synagogue Management"
echo "======================================================="

APP_ID="d3apqb24ywlrck"
echo "📱 App ID: $APP_ID"
echo "🌐 URL: https://$APP_ID.amplifyapp.com"

echo ""
echo "🔧 The 404 error is fixed with the _redirects file."
echo "📁 Updated deployment package: nun-synagogue-fixed.zip"
echo ""
echo "📤 Manual Upload Required:"
echo "1. Go to: https://console.aws.amazon.com/amplify/home#/$APP_ID"
echo "2. Click 'Hosting' tab"
echo "3. Click 'Deploy updates'"
echo "4. Upload: nun-synagogue-fixed.zip"
echo ""
echo "🎯 The fixed version includes:"
echo "   ✅ React Router redirects (_redirects file)"
echo "   ✅ Hebrew RTL interface"
echo "   ✅ All synagogue management features"
echo ""

# Open AWS Console
if command -v open &> /dev/null; then
    read -p "🌐 Open AWS Amplify Console for manual upload? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://console.aws.amazon.com/amplify/home#/$APP_ID"
    fi
fi

echo ""
echo "💡 After upload, the site will be available at:"
echo "   https://$APP_ID.amplifyapp.com"
echo ""
echo "🕍 Hebrew Synagogue Management System - Ready for Production!"
