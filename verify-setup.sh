#!/bin/bash

# RefineLab - Deployment Verification Script
# Run this script to verify your local setup before deploying

echo "🔍 RefineLab - Pre-Deployment Checklist"
echo "========================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file not found - copy .env.example to .env and fill in values"
    exit 1
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed - run: npm install"
fi

# Check if Prisma client is generated
if [ -d node_modules/.prisma ]; then
    echo "✅ Prisma client generated"
else
    echo "⚠️  Prisma client not generated - run: npx prisma generate"
fi

# Check required environment variables
echo ""
echo "🔑 Checking environment variables..."

required_vars=("DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET" "GEMINI_API_KEY" "NEXT_PUBLIC_FIREBASE_API_KEY")

for var in "${required_vars[@]}"; do
    if grep -q "$var=" .env && ! grep -q "$var=\"your-" .env; then
        echo "✅ $var is set"
    else
        echo "❌ $var is missing or uses placeholder value"
    fi
done

echo ""
echo "📋 Next Steps:"
echo "1. Ensure all environment variables are set with real values"
echo "2. Run: npx prisma db push (to initialize database)"
echo "3. Run: npm run build (to verify production build works)"
echo "4. Run: npm run dev (to test locally)"
echo "5. Deploy to Vercel when ready"
echo ""
echo "🛡️  Remember: RefineLab enforces academic integrity at all levels"
echo "   All features provide feedback, not content generation"
echo ""
