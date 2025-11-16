# RefineLab

**A production-ready writing growth engine for students** that analyzes essays, teaches skills, tracks growth over time, and helps understand grading patterns—all while maintaining strict academic integrity.

## 🛡️ Academic Integrity

**RefineLab NEVER generates content you can paste into your essay.** The system provides:

✅ Feedback, insights, metrics, and strategic guidance  
✅ Analysis of structure and identification of weaknesses  
✅ Explanations of WHY something needs improvement  
✅ Conceptual teaching of writing principles  

❌ Does NOT write thesis statements or paragraphs  
❌ Does NOT rewrite or paraphrase your text  
❌ Does NOT generate replacement content  

This is enforced at both the UX level and through LLM system prompts.

## Features

### Core Features

1. **Context-Aware Structure Mapper** - Paragraph-level visualization showing thesis clarity, argument depth, transitions, and analysis quality

2. **Insight-Based Writing Lessons** - Adaptive lessons linked to detected weaknesses (generic principles, not essay-specific text)

3. **Multi-Essay Growth Dashboard** - Track metrics over time with line charts, radar charts, and tables

4. **Real-Time Writing Skill Delta Analyzer** - Compare drafts showing metric improvements (not text diffs)

5. **Grading Pattern Analyzer** - Identify patterns in past grades and rubric dimensions

6. **Pattern-Adaptive Essay Coach** - Strategic prompts linked to specific paragraphs with conceptual guidance

7. **Semester Writing Fingerprint** - Aggregated view of tone, structure, pacing, and evidence habits

8. **Assignment Goal Setting + Progress Tracking** - Define goals and track progress per assignment

9. **Grade Prediction Simulator** - Probabilistic grade band estimates based on metrics and patterns

10. **Document Upload with OCR** - Upload PDFs, DOCX files, or images to extract text and teacher comments

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth + Email/Password)
- **AI**: Google Gemini 2.0 Flash (with academic integrity system prompts)
- **OCR**: Tesseract.js + pdf-parse + mammoth
- **Charts**: Recharts
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- Gemini API key

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd refinelab
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/refinelab?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**To get Gemini API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key

4. **Set up the database**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Set up Postgres database**
   - In Vercel dashboard, go to Storage
   - Create Postgres database
   - Copy DATABASE_URL to environment variables

4. **Configure environment variables**
   - Add all environment variables from `.env`
   - Make sure to use production URLs for NEXTAUTH_URL and Google OAuth redirect URIs

5. **Deploy**
   - Vercel will automatically deploy on push to main branch

## Project Structure

```
refinelab/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── essays/       # Essay CRUD operations
│   │   ├── upload/       # File upload & OCR processing
│   │   ├── compare/      # Essay comparison
│   │   ├── goals/        # Goal tracking
│   │   └── grading-patterns/
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Main dashboard
│   ├── essays/           # Essay list and detail views
│   ├── upload/           # Upload essay page
│   ├── compare/          # Compare drafts page
│   └── page.tsx          # Landing page
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── ai.ts             # Gemini AI integration
│   └── document-processor.ts  # OCR & file processing
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── next-auth.d.ts    # TypeScript declarations
```

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **Essay** - Uploaded essays with metrics and analysis
- **EssayComparison** - Comparison data between essay versions
- **Goal** - User-defined improvement goals
- **GradingPattern** - Historical grading data for analysis

## API Endpoints

### Essays
- `GET /api/essays` - List all essays for authenticated user
- `POST /api/essays` - Create and analyze new essay
- `GET /api/essays/[id]` - Get essay by ID
- `DELETE /api/essays/[id]` - Delete essay

### Upload
- `POST /api/upload` - Upload and process document (PDF/DOCX/Image)

### Compare
- `POST /api/compare` - Compare two essay versions

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal

### Grading Patterns
- `GET /api/grading-patterns` - List patterns
- `POST /api/grading-patterns` - Add pattern

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma client
npx prisma generate

# Create database migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Academic Integrity Implementation

The system enforces academic integrity through multiple layers:

1. **LLM System Prompts** - Hard-coded prompts that instruct the AI to never generate essay content
2. **API Validation** - Backend checks to ensure responses don't violate integrity rules
3. **UI Guardrails** - Frontend warnings and disabled features for prohibited actions
4. **Response Format** - AI outputs are structured as metrics, tags, and bullet points—never continuous prose

## Contributing

This is a production-ready template. Feel free to customize for your specific needs while maintaining the academic integrity protections.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open a GitHub issue.

---

Built with academic integrity at its core. 🛡️
