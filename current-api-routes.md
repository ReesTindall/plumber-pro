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