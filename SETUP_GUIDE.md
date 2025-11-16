# 🚀 Complete Setup Guide for RefineLab

This guide will get you from zero to deployed on Vercel in about 15 minutes.

## 📋 What We're Using

- **Database**: PostgreSQL via Prisma ORM (Vercel Postgres for easy deployment)
- **Auth**: Google OAuth through Firebase
- **AI**: Google Gemini 2.0 Flash Lite
- **Deployment**: Vercel

## Part 1: Get Google OAuth Credentials from Firebase (5 minutes)

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **divergent-unity**
3. Click the gear icon ⚙️ → **Project Settings**

### Step 2: Enable Google Authentication

1. In left sidebar, click **Authentication**
2. Click **Get Started** (if first time) or **Sign-in method** tab
3. Click **Google** provider
4. Toggle **Enable** to ON
5. You'll see your **Web Client ID** - this is what you need!

### Step 3: Get OAuth Credentials

There are TWO ways to get your credentials:

#### Option A: From Firebase (Easiest)

1. In Firebase Console → Project Settings
2. Scroll to **Your apps** section
3. If you don't have a web app, click **Add app** → Web (</>) icon
4. Register app with a nickname (e.g., "RefineLab Web")
5. Copy the config values shown

#### Option B: From Google Cloud Console (More Control)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. You should see an OAuth 2.0 Client ID (created by Firebase)
5. Click on it to see:
   - **Client ID**: Something like `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: Click "Show" to reveal it

### Step 4: Update Your .env File

```env
GOOGLE_CLIENT_ID="YOUR-CLIENT-ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR-CLIENT-SECRET"
```

### Step 5: Configure Authorized Redirect URIs

In Google Cloud Console → Credentials → Your OAuth Client:

Add these URIs:
- `http://localhost:3000/api/auth/callback/google` (for local dev)
- `https://your-app-name.vercel.app/api/auth/callback/google` (for production - add after deploying)

**Important**: You must add the production URL AFTER you deploy to Vercel and know your domain.

---

## Part 2: Setup Database with Vercel Postgres (3 minutes)

### Why Vercel Postgres?

- ✅ Free tier: 256 MB storage, 60 hours compute
- ✅ Automatic SSL
- ✅ Zero configuration with Vercel
- ✅ Built-in connection pooling

### Step 1: Create Database (Before Deploying)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** tab in top menu
3. Click **Create Database**
4. Select **Postgres**
5. Choose a database name: `refinelab-db`
6. Select region closest to you
7. Click **Create**

### Step 2: Get Connection String

1. After creation, you'll see database details
2. Click **.env.local** tab
3. Copy the `POSTGRES_URL` value
4. This is your `DATABASE_URL`!

### Step 3: Update Local .env

```env
DATABASE_URL="your-vercel-postgres-url-here"
```

**Example format:**
```
postgres://default:abc123@xyz-abc-123.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

### Alternative: Other Database Options

If you prefer different providers:

#### Neon (Free tier: 3 GB)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create project
3. Copy connection string

#### Supabase (Free tier: 500 MB)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Settings → Database → Connection string (URI)

#### Railway (Free tier: 1 GB)
1. Go to [railway.app](https://railway.app)
2. New project → PostgreSQL
3. Copy connection string

---

## Part 3: Setup Your Local Environment (5 minutes)

### Step 1: Install Dependencies

```bash
cd /Users/naitikgupta/Projects/refinelab
npm install
```

**If npm install fails on canvas/pdf-parse:**
```bash
# On macOS, you might need:
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman

# Then retry:
npm install
```

### Step 2: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Verify it worked (opens database GUI)
npx prisma studio
```

You should see 8 tables:
- users
- accounts
- sessions
- verification_tokens
- essays
- essay_comparisons
- goals
- grading_patterns
- writing_fingerprints

### Step 3: Verify Your .env File

Make sure you have all these set:

```env
DATABASE_URL="your-vercel-postgres-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="5ICwjDsVJG+DMrSWYUXfcB6mSokItCsPJuPYXza4w/k="
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GEMINI_API_KEY="AIzaSyCWO1_l1H8pu9CB1adKRr01EmK-7UCNFYA"
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Test Google Login

1. Click "Sign In"
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to dashboard

**If it fails:**
- Check browser console for errors
- Verify redirect URI is added in Google Cloud Console
- Make sure both CLIENT_ID and CLIENT_SECRET are correct

---

## Part 4: Deploy to Vercel (2 minutes)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/refinelab.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" next to your repository
3. Click "Import"

### Step 3: Connect Your Database

Since you already created the Vercel Postgres database:

1. In Vercel, during project setup, click **Storage** tab
2. Click **Connect Store**
3. Select your `refinelab-db` database
4. Click **Connect**

This automatically adds `DATABASE_URL` environment variable!

### Step 4: Add Other Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = 5ICwjDsVJG+DMrSWYUXfcB6mSokItCsPJuPYXza4w/k=
GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-client-secret
GEMINI_API_KEY = AIzaSyCWO1_l1H8pu9CB1adKRr01EmK-7UCNFYA
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyCyQCC2Xr7dguLXKQpX2GTzW37frPGlpQU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = divergent-unity.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = divergent-unity
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = divergent-unity.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 857677210812
NEXT_PUBLIC_FIREBASE_APP_ID = 1:857677210812:web:f2ec2e5cac265664e45cb9
```

### Step 5: Deploy

Click **Deploy**

Wait 2-3 minutes for build to complete.

### Step 6: Update Google OAuth Redirect URI

1. Note your Vercel URL: `https://your-app-name.vercel.app`
2. Go to Google Cloud Console → Credentials
3. Add new Authorized redirect URI:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
4. Save

### Step 7: Test Production

1. Visit your Vercel URL
2. Try signing in with Google
3. Upload an essay
4. Verify everything works!

---

## 🎯 Understanding the Stack

### Prisma (ORM) + PostgreSQL (Database)

- **Prisma**: Tool that makes talking to database easy
- **PostgreSQL**: The actual database storing your data
- **Vercel Postgres**: PostgreSQL hosted by Vercel (Neon under the hood)

Think of it like:
- PostgreSQL = The filing cabinet
- Prisma = The organized system to find files
- Vercel Postgres = Filing cabinet hosted in the cloud

### Why This Approach?

- Prisma gives you type-safety (catches errors before runtime)
- PostgreSQL is reliable and scales well
- Vercel Postgres is serverless (only pay for what you use)

---

## 🔧 Troubleshooting

### "Failed to push schema"

**Solution:**
```bash
# Reset and try again
npx prisma migrate reset
npx prisma db push
```

### "Google OAuth error: redirect_uri_mismatch"

**Solution:**
1. Check exact URL in error message
2. Add that EXACT URL to Google Cloud Console → Credentials → Redirect URIs
3. Wait 5 minutes for changes to propagate
4. Try again

### "Module 'canvas' not found" when uploading PDF

**Solution:**

On macOS:
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
npm install canvas
```

On Linux:
```bash
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas
```

On Windows:
- Download GTK+ from [here](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases)
- Install and add to PATH
- `npm install canvas`

**Alternative**: If canvas is problematic, you can disable PDF parsing temporarily by modifying `/lib/document-processor.ts` to return an error for PDFs.

### "Prisma Client not found"

**Solution:**
```bash
npx prisma generate
npm run dev
```

### "Database connection failed"

**Solution:**
1. Verify DATABASE_URL is correct
2. Check database is accessible (try `npx prisma studio`)
3. Ensure SSL mode is correct (`?sslmode=require` for Vercel)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] Can open http://localhost:3000
- [ ] Google sign-in works locally
- [ ] Can upload an essay (PDF or text)
- [ ] Essay analysis shows up
- [ ] Dashboard displays data
- [ ] Vercel deployment successful
- [ ] Google sign-in works in production
- [ ] Can upload essay in production

---

## 📚 Quick Reference

### Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server

# Database
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema to database
npx prisma studio              # Open database GUI
npx prisma migrate reset       # Reset database (careful!)

# Deployment
vercel                         # Deploy to Vercel
vercel --prod                  # Deploy to production
```

### Important Files

- `.env` - Environment variables (never commit!)
- `prisma/schema.prisma` - Database schema
- `lib/auth.ts` - Authentication configuration
- `lib/ai.ts` - AI analysis with integrity protection

### Support Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)

---

## 🎉 You're Done!

Your RefineLab instance should now be:
- ✅ Running locally
- ✅ Connected to database
- ✅ Google OAuth working
- ✅ Deployed to Vercel
- ✅ Production-ready

Need help? Check `TROUBLESHOOTING.md` for common issues.
