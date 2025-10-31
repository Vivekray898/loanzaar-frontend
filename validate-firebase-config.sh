#!/bin/bash
# Firebase Configuration Validator
# Run this script from the frontend directory to verify all environment variables are set

echo "🔍 Firebase Configuration Validator"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in $(pwd)"
    echo "📋 Please create a .env file with Firebase configuration"
    exit 1
fi

# List of required environment variables
required_vars=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
    "VITE_FCM_VAPID_KEY"
)

missing_vars=()
found_vars=()

# Check each variable
for var in "${required_vars[@]}"; do
    value=$(grep "^${var}=" .env | cut -d '=' -f 2- | tr -d ' ')
    
    if [ -z "$value" ] || [ "$value" == "your_*_here" ] || [[ "$value" == "your_"* ]]; then
        missing_vars+=("$var")
        echo "❌ $var: NOT SET or has placeholder value"
    else
        # Show first 10 chars of value (for privacy)
        masked="${value:0:10}..."
        found_vars+=("$var")
        echo "✅ $var: $masked"
    fi
done

echo ""
echo "===================================="

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✅ All Firebase configuration variables are set!"
    echo ""
    echo "📋 Found:"
    for var in "${found_vars[@]}"; do
        echo "   ✓ $var"
    done
    echo ""
    echo "✅ Ready to run: npm run dev"
    exit 0
else
    echo "⚠️  Missing or incomplete configuration variables:"
    echo ""
    for var in "${missing_vars[@]}"; do
        echo "   • $var"
    done
    echo ""
    echo "📋 Steps to fix:"
    echo "1. Go to https://console.firebase.google.com"
    echo "2. Select your project → Project Settings → General"
    echo "3. Copy the SDK configuration values"
    echo "4. Update the missing variables in .env"
    echo ""
    echo "Run this script again to verify configuration"
    exit 1
fi
