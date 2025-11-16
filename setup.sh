#!/bin/bash

echo "🚀 RefineLab Setup Script"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file first. See SETUP_GUIDE.md"
    exit 1
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=\"postgresql://user:password@localhost" .env; then
    echo "⚠️  WARNING: DATABASE_URL still has placeholder values"
    echo ""
    echo "You need to set up a database first:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Click Storage → Create Database → Postgres"
    echo "3. Copy the DATABASE_URL"
    echo "4. Update it in your .env file"
    echo ""
    echo "Or use another provider (Neon, Supabase, Railway)"
    echo "See SETUP_GUIDE.md Part 2 for details"
    echo ""
    read -p "Press Enter to continue anyway (will fail) or Ctrl+C to exit..."
fi

# Check if Google OAuth is configured
if grep -q "GOOGLE_CLIENT_ID=\"your-google-client-id" .env; then
    echo "⚠️  WARNING: GOOGLE_CLIENT_ID not configured"
    echo ""
    echo "You need to get Google OAuth credentials:"
    echo "1. Go to https://console.firebase.google.com"
    echo "2. Select project: divergent-unity"
    echo "3. Go to Authentication → Sign-in method → Google"
    echo "4. Copy the Web Client ID and Secret"
    echo "5. Update in your .env file"
    echo ""
    echo "See SETUP_GUIDE.md Part 1 for detailed instructions"
    echo ""
    read -p "Press Enter to continue anyway (Google sign-in won't work) or Ctrl+C to exit..."
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    echo ""
    echo "If you're on macOS and see canvas/pdf-parse errors:"
    echo "  brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman"
    echo "  npm install"
    echo ""
    exit 1
fi

echo ""
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed"
    echo "Check your DATABASE_URL in .env"
    exit 1
fi

echo ""
echo "📊 Pushing database schema..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Database push failed"
    echo ""
    echo "Common issues:"
    echo "1. DATABASE_URL is incorrect"
    echo "2. Database server is not accessible"
    echo "3. Database doesn't exist yet"
    echo ""
    echo "See SETUP_GUIDE.md Part 2 for database setup"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify your .env file has all required values"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo "4. Sign in with Google"
echo ""
echo "📚 For deployment to Vercel, see SETUP_GUIDE.md Part 4"
echo ""
