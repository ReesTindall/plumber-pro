# Current Sprint: Week 1-2 Foundation

## Sprint Goal
Get authentication working with Supabase and basic project structure set up.

## Completed
- [x] Initialize Next.js 14 with TypeScript
- [x] Set up local Supabase
- [x] Configure environment variables

## TODO This Sprint
- [ ] Create initial migration files for users, customers, jobs tables
- [ ] Implement Supabase Auth (register/login/logout)
- [ ] Create basic layout with mobile-first design
- [ ] Add environment detection system (show TEST MODE banner)
- [ ] Set up error handling utilities
- [ ] Create protected route middleware
- [ ] Deploy to Vercel (preview pipeline working)
- [ ] Write basic auth tests

## Current Focus
Working on database migrations and auth flow.

## Key Files
- `/supabase/migrations/00001_initial_schema.sql` - Create this
- `/app/auth/register/page.tsx` - Build registration
- `/app/auth/login/page.tsx` - Build login
- `/lib/supabase.ts` - Supabase client setup
- `/middleware.ts` - Protected routes

## Design Requirements This Sprint
- Mobile-first (test on phone viewport)
- Big touch targets (min 48px)
- Auto-save form progress
- Show loading states everywhere
- Clear error messages

## Test Commands
```bash
npm run dev          # Local development
supabase db reset    # Reset local DB
npm test            # Run tests