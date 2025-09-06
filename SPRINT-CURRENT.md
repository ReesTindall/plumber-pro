# Current Sprint: Week 3-4 Core Features

## Previous Sprint (Week 1-2) ✅ COMPLETED
Successfully completed authentication foundation and project setup.

## Sprint Goal
Implement customer management CRUD operations and basic job scheduling functionality.

## Completed (From Previous Sprint) ✅
- [x] Initialize Next.js 15 with TypeScript
- [x] Set up local Supabase
- [x] Configure environment variables
- [x] Create initial migration files for all tables
- [x] Implement Supabase Auth (register/login/logout)
- [x] Email verification workflow
- [x] Create basic layout with mobile-first design
- [x] Add environment detection system (TEST MODE banner)
- [x] Set up error handling utilities
- [x] Create protected route middleware
- [x] Deploy to Vercel (preview pipeline working)
- [x] Session management with SessionProvider
- [x] Fix RLS policy issues
- [x] Dashboard layout with navigation

## TODO This Sprint (Week 3-4)

### Customer Management
- [ ] Create customer list page (`/dashboard/customers`)
  - [ ] Search functionality
  - [ ] Filter by status (active/archived)
  - [ ] Pagination
- [ ] Add new customer form (`/dashboard/customers/new`)
  - [ ] Form validation
  - [ ] Address autocomplete (Google Places API)
  - [ ] Phone number formatting
- [ ] Customer detail page (`/dashboard/customers/[id]`)
  - [ ] Display customer info
  - [ ] Job history
  - [ ] Notes section
- [ ] Edit customer functionality
- [ ] Archive/delete customer with confirmation

### Job Management
- [ ] Create job form (`/dashboard/jobs/new`)
  - [ ] Customer selection
  - [ ] Date/time picker
  - [ ] Job type selection
  - [ ] Quick job vs detailed job
- [ ] Job list page (`/dashboard/jobs`)
  - [ ] Calendar view
  - [ ] List view
  - [ ] Filter by status
- [ ] Job detail page (`/dashboard/jobs/[id]`)
  - [ ] Status updates
  - [ ] Add notes
  - [ ] Convert to invoice

### Basic Invoice Generation
- [ ] Create invoice from job
- [ ] Invoice preview
- [ ] Basic PDF generation
- [ ] Email invoice (basic template)

## Current Focus
Starting with customer list page and add customer form.

## Key Files to Create/Modify
- `/src/app/dashboard/customers/page.tsx` - Customer list
- `/src/app/dashboard/customers/new/page.tsx` - Add customer
- `/src/app/dashboard/customers/[id]/page.tsx` - Customer detail
- `/src/app/api/customers/route.ts` - Customer API endpoints
- `/src/app/dashboard/jobs/page.tsx` - Job list
- `/src/app/dashboard/jobs/new/page.tsx` - Create job
- `/src/app/api/jobs/route.ts` - Job API endpoints

## Design Requirements This Sprint
- Consistent with existing dashboard design
- Mobile-responsive tables
- Loading skeletons for data fetching
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Form auto-save where appropriate

## Testing Checklist
- [ ] Customer CRUD operations work
- [ ] Search and filters function correctly
- [ ] Forms validate properly
- [ ] Error states display appropriately
- [ ] Mobile layout works well
- [ ] Data persists correctly in database

## Definition of Done
- Feature works on local development
- Feature works on Vercel preview
- Mobile responsive
- Error handling implemented
- Loading states shown
- Database operations use proper RLS
- Code follows TypeScript best practices

## Sprint Timeline
- **Start Date**: September 6, 2025
- **End Date**: September 20, 2025
- **Sprint Review**: End of Week 4

## Notes
- Focus on getting basic CRUD working first
- Polish and advanced features can come later
- Keep mobile experience as priority
- Test with real-world data scenarios

## Blockers/Issues
- None currently

## Next Sprint Preview (Week 5-6)
- Complete invoice system
- Implement estimate creation
- Add messaging capabilities
- Basic reporting dashboard