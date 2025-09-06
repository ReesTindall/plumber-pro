# PlumberPro MVP Technical Specification

**Claude Code Optimized - Version 2.1**  
**Last Updated: September 5, 2025**

## Executive Summary

Building a streamlined CRM for 1-3 person plumbing companies fresh out of trade school. Focus on saving time through route optimization, professional estimates/invoicing, and automated customer communication while maintaining user control and professional appearance.

- **Target Launch**: 6 weeks from start (October 2025)
- **Target Users**: Small plumbing startups (1-3 people)
- **Core Value Prop**: Save $1,500+/month in operational inefficiency
- **Development Method**: Claude Code with continuous context updates
- **Current Status**: MVP in development, authentication complete, Vercel preview active

## Project Structure

```
plumber-pro/
├── CLAUDE.md                # Core context for Claude AI
├── TECH_SPEC.md            # This file - source of truth
├── progress.md              # Development progress tracking
├── current-api-routes.ts    # List of all API endpoints
├── SPRINT-CURRENT.md        # Current sprint tasks
├── deploy.sh                # Deployment script
├── .env.local               # Local environment variables
├── .env.example             # Environment template
├── supabase/
│   ├── migrations/          # Version-controlled schema changes
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_add_rls_policies.sql
│   │   └── 00003_add_estimates.sql
│   ├── seed.sql            # Development test data
│   └── config.toml         # Supabase configuration
├── src/
│   ├── app/                 # Next.js 15 app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── login/          # Auth pages
│   │   └── register/
│   └── components/         # Page-specific components
├── components/              # Shared components
├── lib/                     # Shared utilities
├── public/                  # Static assets
└── tests/                   # Test specifications
    ├── unit/
    ├── integration/
    └── e2e/

## Deployment Architecture (Current Implementation)

### Environment Strategy

**Local Development:**
- URL: localhost:3000 (or 3001 if port conflict)
- Database: Local Supabase (supabase start)
- Auth: Local Supabase Auth with Inbucket
- Status: ✅ Working

**Preview (development branch):**
- URL: https://plumber-c0vavbnwz-rees-projects-a5599142.vercel.app
- Database: Production Supabase (safe test data)
- Auth: Production Supabase with email verification
- Status: ✅ Active and working

**Production (main branch):**
- URL: app.plumberpro.com (pending)
- Database: Production Supabase
- Auth: Production with full email service
- Status: 🚧 Not deployed yet
Database Migration Strategy
Single Source of Truth: All schema changes MUST go through migration files. Never modify schema through Supabase dashboard.


bash
# Development workflow
supabase migration new add_feature     # Create migration file
supabase db reset                      # Apply all migrations locally
npm run dev                            # Test locally

# Deployment workflow
git push origin feature-branch         # Creates preview deployment
# Test on preview URL
git merge main                         # Deploys to production
Environment Variables Setup
In Vercel Dashboard, set these for both Preview and Production:


env
# Same across all environments
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
GOOGLE_MAPS_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# Different per environment
NEXT_PUBLIC_ENVIRONMENT=preview|production
STRIPE_SECRET_KEY=sk_test_xxx|sk_live_xxx
SQUARE_ACCESS_TOKEN=sandbox_xxx|prod_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx|whsec_live_xxx

## Technical Architecture

### Core Stack (Implemented)
* **Framework**: Next.js 15.5.2 (App Router) + TypeScript ✅
* **Styling**: Tailwind CSS ✅
* **Database**: Supabase (PostgreSQL + Auth + Storage) ✅
* **Hosting**: Vercel (automatic preview + production) ✅
* **Authentication**: Supabase Auth with email verification ✅

### Integrations (Planned)
* **Payments**: Stripe Connect AND Square (user choice) 📋
* **SMS**: Twilio 📋
* **Maps**: Google Maps API 📋
* **Testing**: Jest + React Testing Library + Playwright 📋
Monorepo Benefits
Single repository containing everything. This simplifies:
* Claude Code context management
* Deployment (one push = full deploy)
* Database migrations alongside code
* Environment variable management

Development Progress Tracker
Week 1-2: Foundation
*  Initialize Next.js 14 with TypeScript
*  Set up local Supabase
*  Create initial migration files
*  Implement Supabase Auth
*  Basic routing and layout
*  Environment detection system
*  Vercel deployment pipeline
*  Basic error handling
Week 3-4: Core Features
*  Combined customer+job creation form
*  Customer search/autocomplete
*  Job management CRUD
*  Daily route optimization
*  Google Maps integration
*  Mobile responsive layout
*  Preview environment testing
Week 5-6: Polish & Payments
*  Estimate builder with templates
*  Digital signature capture
*  Invoice generation with PDF
*  Stripe Connect integration
*  Square integration
*  SMS notifications via Twilio
*  Production deployment
*  E2E tests on production

Core Features Specification
1. Authentication & Onboarding


Requirements:
- 2-minute setup maximum
- Email/password only for MVP
- Skip-able Stripe/Square setup
- Auto-save progress
- Environment-aware (show test mode banner)

Test Cases:
- User can register in under 2 minutes
- Preview shows "TEST MODE" banner
- Can skip payment setup and add later
2. Smart Job Creation ⭐ CRITICAL


Requirements:
- Single form for job + customer
- Autocomplete existing customers
- Inline new customer creation
- Default to today + afternoon
- Never need to navigate away
- Auto-save on every field blur

Test Cases:
- Can create job with new customer in one form
- Typing partial name finds existing customer
- Form persists on page refresh
- Works on mobile with fat fingers
3. Route Optimization


Requirements:
- One-click optimization
- Show time/distance saved
- Export to Google Maps
- Manual reorder available
- Works with 2-20 stops

Test Cases:
- Optimizes 5 stops correctly
- Shows accurate time savings
- Opens Google Maps with waypoints
- Can drag to reorder after optimization
4. Professional Invoicing ⭐ CRITICAL


Requirements:
- 3 template designs
- Preview before sending
- Auto-formatting (phone, address)
- PDF generation
- Never shows $0.00 lines
- Test mode watermark in preview

Test Cases:
- Invoice looks professional on all devices
- Phone numbers formatted correctly
- PDF matches preview exactly
- Test payments show TEST MODE
5. Payment Processing


Requirements:
- Support both Stripe and Square
- On-site payment
- Text payment links
- No stored card data
- Environment-aware (test vs live)
- Clear fee disclosure

Test Cases:
- Test payments work in preview
- Live payments only in production
- Payment link works on customer phone
- Correct amount charged

Database Schema & Migrations
Migration Files Structure
Every schema change must be a new migration file. Never modify existing migrations.


sql
-- supabase/migrations/00001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (plumbing businesses)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  service_zips TEXT[],
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'square', NULL)),
  stripe_account_id TEXT,
  square_merchant_id TEXT,
  invoice_template TEXT DEFAULT 'classic',
  default_tax_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Safe policy creation
DROP POLICY IF EXISTS users_policy ON users;
CREATE POLICY users_policy ON users
  FOR ALL USING (auth.uid() = id);


sql
-- supabase/migrations/00002_add_customers_jobs.sql
-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quick_customer JSONB, -- For one-time customers
  scheduled_date DATE NOT NULL,
  time_window TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  type TEXT NOT NULL,
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS customers_policy ON customers;
CREATE POLICY customers_policy ON customers
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS jobs_policy ON jobs;
CREATE POLICY jobs_policy ON jobs
  FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_date ON jobs(user_id, scheduled_date);


sql
-- supabase/migrations/00003_add_estimates_invoices.sql
-- Estimate templates
CREATE TABLE IF NOT EXISTS estimate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_price DECIMAL(10,2) NOT NULL,
  last_used_price DECIMAL(10,2),
  usage_count INTEGER DEFAULT 0,
  price_history DECIMAL(10,2)[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimates
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  signature_url TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  payment_provider TEXT,
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE estimate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY estimate_templates_policy ON estimate_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY estimates_policy ON estimates
  FOR ALL USING (
    job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid())
  );

CREATE POLICY invoices_policy ON invoices
  FOR ALL USING (
    estimate_id IN (
      SELECT e.id FROM estimates e
      JOIN jobs j ON e.job_id = j.id
      WHERE j.user_id = auth.uid()
    )
  );

Standardized Error Handling
All errors follow this format:


typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
  }
}

// Standard error codes
export const ErrorCodes = {
  // Auth errors (AUTH_*)
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  
  // Database errors (DB_*)
  DB_UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  
  // Business logic errors (BIZ_*)
  BIZ_INVALID_JOB_STATUS: 'BIZ_INVALID_JOB_STATUS',
  BIZ_PAYMENT_FAILED: 'BIZ_PAYMENT_FAILED',
  
  // Integration errors (INT_*)
  INT_STRIPE_ERROR: 'INT_STRIPE_ERROR',
  INT_TWILIO_ERROR: 'INT_TWILIO_ERROR',
  INT_MAPS_ERROR: 'INT_MAPS_ERROR'
} as const;

// API Response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

Environment Configuration


typescript
// lib/config.ts
export const config = {
  // Environment detection
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  isPreview: process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Feature flags based on environment
  features: {
    testMode: process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production',
    debugMode: process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview',
  },
  
  // Payment configuration (automatically uses test keys in preview)
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    },
    square: {
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      applicationId: process.env.SQUARE_APPLICATION_ID!,
      locationId: process.env.SQUARE_LOCATION_ID!,
    }
  },
  
  // URLs
  urls: {
    app: config.isProduction 
      ? 'https://app.plumberpro.com'
      : config.isPreview 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
  }
};

// Environment banner component
export function EnvironmentBanner() {
  if (config.isPreview) {
    return (
      <div className="bg-yellow-400 text-black p-2 text-center font-bold">
        ⚠️ TEST MODE - Using test payment keys
      </div>
    );
  }
  if (config.isDevelopment) {
    return (
      <div className="bg-blue-500 text-white p-2 text-center">
        🛠️ Development Environment
      </div>
    );
  }
  return null;
}

Simplified Deployment Script


bash
#!/bin/bash
# deploy.sh - Simplified deployment with single database

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Local development commands
if [ "$1" = "reset" ]; then
  echo -e "${YELLOW}Resetting local database...${NC}"
  supabase db reset
  echo -e "${GREEN}✓ Local database reset complete${NC}"
  exit 0
fi

if [ "$1" = "migrate" ]; then
  echo -e "${YELLOW}Creating new migration...${NC}"
  supabase migration new $2
  echo -e "${GREEN}✓ Migration file created${NC}"
  exit 0
fi

if [ "$1" = "local" ]; then
  echo -e "${YELLOW}Starting local development...${NC}"
  supabase start
  npm run dev
  exit 0
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}✗ Uncommitted changes detected${NC}"
  echo "Please commit or stash changes before deploying"
  exit 1
fi

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Tests failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Tests passed${NC}"

# Handle deployment based on branch
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo -e "${YELLOW}🚀 PRODUCTION DEPLOYMENT${NC}"
  
  # Run integration tests for production
  echo -e "${YELLOW}Running integration tests...${NC}"
  npm run test:integration
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Integration tests failed${NC}"
    exit 1
  fi
  
  # Apply any pending migrations to production
  echo -e "${YELLOW}Applying production migrations...${NC}"
  supabase db push --linked
  
  # Push to main (triggers Vercel production deployment)
  git push origin main
  
  echo -e "${GREEN}✓ Production deployment complete!${NC}"
  echo -e "URL: https://app.plumberpro.com"
  
else
  echo -e "${YELLOW}📝 PREVIEW DEPLOYMENT${NC}"
  echo -e "Branch: $CURRENT_BRANCH"
  
  # Push to branch (triggers Vercel preview deployment)
  git push origin $CURRENT_BRANCH
  
  echo -e "${GREEN}✓ Preview deployment initiated!${NC}"
  echo -e "URL will be: https://plumberpro-git-${CURRENT_BRANCH}.vercel.app"
  echo -e "${YELLOW}Note: Using production database with TEST payment keys${NC}"
fi

# Show deployment status
echo -e "\n${YELLOW}Check deployment status:${NC}"
echo "https://vercel.com/dashboard"

Testing Specifications
Unit Tests


typescript
// Every utility function must have tests
describe('formatPhoneNumber', () => {
  it('formats 10 digit number', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });
});
Integration Tests


typescript
// Test API routes with database
describe('POST /api/jobs', () => {
  it('creates job with new customer', async () => {
    // Test the combined creation flow
  });
});
E2E Tests (Critical Paths)


typescript
// Playwright tests for critical flows
test('Complete job from creation to payment', async ({ page }) => {
  const isPreview = process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview';
  
  // 1. Create job
  // 2. Generate estimate  
  // 3. Get signature
  // 4. Process payment (test card if preview)
  
  if (isPreview) {
    await expect(page.locator('.environment-banner')).toContainText('TEST MODE');
  }
});

API Routes Structure
See current-api-routes.md for full list. All routes include environment detection:


typescript
// app/api/payments/charge/route.ts
export async function POST(request: Request) {
  // Automatically use test keys in preview
  const stripe = new Stripe(
    config.payments.stripe.secretKey,
    { apiVersion: '2023-10-16' }
  );
  
  if (config.isPreview) {
    // Log but don't charge in preview
    console.log('[TEST MODE] Would charge:', amount);
  }
  
  // ... rest of implementation
}

Claude Code Instructions
When using Claude Code with this project:
1. Start with migration check: Always run supabase db reset before starting work
2. Check .claude-context for current development state
3. Reference claude-examples.md for code patterns
4. Update migrations: Never modify schema in Supabase dashboard
5. Test locally first: Use npm run dev with local Supabase
6. Create preview: Push branch for automatic preview deployment
7. Check environment: Always show test mode banner in preview
8. Auto-save everything: Users aren't tech savvy
Common Commands


bash
# Local development
./deploy.sh local           # Start everything locally
./deploy.sh reset          # Reset local database
./deploy.sh migrate [name] # Create new migration

# Deployment
git push origin [branch]   # Creates preview
git push origin main       # Deploys to production

# Testing
npm test                   # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # E2E tests

Success Metrics
Development Efficiency
* Migration application: < 30 seconds
* Preview deployment: < 2 minutes
* Local reset: < 10 seconds
* Test suite run: < 1 minute
User Metrics
* Setup time: < 10 minutes
* First job created: < 2 minutes
* Route optimization usage: > 50%
* Same-day payments: > 80%

Cost Structure
Monthly Operating Costs
* Vercel Pro: $20 (only when needed)
* Supabase: $25 (single project)
* Twilio: ~$50 (usage-based)
* Google Maps: ~$100 (usage-based)
* Domain: $10
* Total: ~$205/month
Free Tier Limits
* Vercel: Good for 100+ preview deployments/month
* Supabase Free: 500MB storage, 2GB transfer
* Google Maps: $200 credit monthly

Supporting Files
.claude-context


markdown
# PlumberPro CRM Context

## Project Overview
Building MVP CRM for 1-3 person plumbing companies. Focus on route optimization, professional invoicing, and easy job creation. Users are NOT tech-savvy.

## Current Development State
- Phase: Project Setup
- Sprint: Week 1 of 6
- Environment: Development

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Supabase (Database + Auth)  
- Tailwind CSS + shadcn/ui
- Stripe + Square for payments
- Testing with Jest + Playwright

## Critical Design Principles
1. **Mobile-first** - Most usage on phones
2. **Non-tech users** - Everything obvious, big buttons
3. **Combined forms** - Never separate customer+job creation
4. **Professional output** - Invoices must look perfect
5. **Auto-save everything** - No lost data ever

## Key Features Priority
1. Smart job creation (customer + job in one form)
2. Route optimization (save drive time)
3. Professional invoices (build trust)
4. Payment processing (get paid same day)
5. SMS automation (stay professional)

## Current Focus
- [ ] Setting up project structure
- [ ] Implementing Supabase auth
- [ ] Creating database schema

## Architecture Decisions
- Monorepo (frontend + backend together)
- Single Supabase project (no staging DB)
- Preview deployments use prod DB with test keys
- All schema changes through migrations
- Row Level Security for all data access

## Migration Strategy
- Never modify schema in dashboard
- All changes through migration files
- Use supabase db reset locally
- Preview and prod share same DB

## Environment Strategy
- Local: localhost with local Supabase
- Preview: Vercel preview with test keys
- Production: Main branch only with live keys

## Files Being Worked On
- /app/layout.tsx
- /app/page.tsx
- /lib/supabase.ts

## Remember
- Users are plumbers with dirty hands
- Every minute saved = money earned
- Trust is everything (especially invoices)
- Test mode banner in preview
current-api-routes.md


markdown
# API Routes Documentation

## Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/session` - Get current user

## Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job (with optional customer)
- `GET /api/jobs/[id]` - Get single job
- `PATCH /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Archive job

## Customers  
- `GET /api/customers` - List/search customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer with history
- `PATCH /api/customers/[id]` - Update customer

## Routes
- `POST /api/routes/optimize` - Optimize route for date
- `GET /api/routes/[date]` - Get route for specific date

## Estimates
- `POST /api/estimates` - Create estimate
- `GET /api/estimates/[id]` - Get estimate
- `POST /api/estimates/[id]/signature` - Add signature
- `POST /api/estimates/[id]/invoice` - Convert to invoice

## Invoices
- `GET /api/invoices/[id]` - Get invoice
- `POST /api/invoices/[id]/send` - Send to customer
- `GET /api/invoices/[id]/pdf` - Generate PDF

## Payments
- `POST /api/payments/stripe/connect` - Connect Stripe
- `POST /api/payments/square/connect` - Connect Square  
- `POST /api/payments/charge` - Process payment
- `POST /api/payments/link` - Generate payment link

## SMS
- `POST /api/sms/send` - Send custom SMS
- `POST /api/sms/templates/[type]` - Send template SMS

Current Blockers
* None

Next Immediate Tasks
1. Initialize Next.js project with TypeScript
2. Set up local Supabase
3. Create initial migration files
4. Configure Vercel project with environment variables
5. Test preview deployment pipeline

This simplified approach eliminates:
* Staging database synchronization headaches (50% of your time saved!)
* Complex environment management
* Migration confusion between environments
* Duplicate configuration and maintenance
The single database with environment-aware code gives you the safety of testing without the complexity. Preview deployments with test keys provide perfect testing without the overhead of managing multiple databases.
