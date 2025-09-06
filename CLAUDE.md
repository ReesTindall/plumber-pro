# Claude AI Context File

## Project Overview
PlumberPro is a comprehensive CRM system designed for small plumbing businesses. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Current State (September 5, 2025)
- **Development Stage**: MVP in progress
- **Deployment**: Vercel preview active, production pending
- **Database**: Supabase configured (local & remote)
- **Authentication**: Fully implemented with email verification

## Tech Stack
- **Frontend**: Next.js 15.5.2 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email verification
- **Deployment**: Vercel
- **Payment**: Stripe & Square (pending implementation)
- **SMS**: Twilio (pending implementation)
- **Maps**: Google Maps API (pending implementation)

## Project Structure
```
plumber-pro/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── login/        # Auth pages
│   │   └── register/
│   └── components/       # Shared components
├── components/           # Root components (auth, layout)
├── lib/                  # Utilities and configurations
├── types/                # TypeScript type definitions
├── supabase/            # Database migrations and config
└── public/              # Static assets
```

## Key Files to Know
- `deploy.sh` - Deployment and development scripts
- `.env.local` - Environment variables (local dev)
- `middleware.ts` - Auth middleware for protected routes
- `lib/supabase/client.ts` - Supabase client config
- `types/database.ts` - Generated database types

## Current Implementation Status

### ✅ Completed
- User authentication system
- Email verification workflow
- Dashboard layout and navigation
- Database schema and migrations
- RLS policies for security
- Session management
- API route for user registration
- Vercel deployment pipeline

### 🚧 In Progress
- Customer CRUD operations
- Job management system
- Invoice generation

### 📋 Pending
- Payment processing (Stripe/Square)
- SMS notifications (Twilio)
- Route optimization (Google Maps)
- Reporting and analytics
- Email templates
- Estimate management

## Common Commands
```bash
# Local development
./deploy.sh local

# Build project
./deploy.sh build

# Deploy to Vercel
./deploy.sh vercel

# Database migrations
npx supabase migration new <name>
npx supabase db push

# Type generation
npx supabase gen types typescript --local > types/database.ts
```

## Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# APIs (pending)
GOOGLE_MAPS_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
SQUARE_ACCESS_TOKEN
```

## Known Issues & Solutions

### Authentication Issues
- **Problem**: AuthSessionMissingError
- **Solution**: Implemented SessionProvider and proper session checks

### Build Issues
- **Problem**: Module import paths
- **Solution**: Check tsconfig.json path mappings

### RLS Policy Violations
- **Problem**: Can't insert user profiles
- **Solution**: Use service role key in API routes

## Database Schema

### Core Tables
- `users` - Business user accounts
- `customers` - Customer records
- `jobs` - Service jobs
- `estimates` - Job estimates
- `invoices` - Billing records
- `messages` - Communication logs

## API Routes
- `POST /api/auth/register` - User registration with profile

## Development Workflow
1. Create feature branch from `development`
2. Implement feature with proper TypeScript types
3. Test locally with `./deploy.sh local`
4. Commit and push to trigger Vercel preview
5. Merge to `development` after testing
6. Deploy to production when ready

## Testing Approach
- Local: Use Supabase local instance
- Email: Check Inbucket at http://127.0.0.1:54324
- Preview: Test on Vercel preview deployments
- Production: Full testing before release

## Recent Changes (Last Session)
1. Fixed authentication flow with email verification
2. Resolved RLS policy issues with service role
3. Added SessionProvider for auth state management
4. Fixed build errors and import paths
5. Successfully deployed to Vercel preview

## Next Priority Tasks
1. Complete customer CRUD operations
2. Implement job creation and scheduling
3. Basic invoice generation from jobs
4. Add search and filter functionality
5. Implement basic reporting

## Important Links
- **GitHub**: https://github.com/ReesTindall/plumber-pro
- **Vercel Preview**: https://plumber-c0vavbnwz-rees-projects-a5599142.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/twgvlwvrsysegkbggegh
- **Local Dev**: http://localhost:3000

## Notes for Claude
- Always check for existing implementations before creating new files
- Use TypeScript strictly - avoid `any` types
- Follow existing code patterns and conventions
- Test authentication flows thoroughly
- Remember to update migration files for schema changes
- Use service role key for admin operations only
- Keep components modular and reusable
- Maintain consistent error handling patterns