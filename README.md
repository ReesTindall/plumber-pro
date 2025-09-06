# PlumberPro CRM

A comprehensive Customer Relationship Management system designed specifically for small plumbing businesses. Built with modern web technologies to streamline job management, customer relations, and business operations.

## 🚀 Live Demo

- **Preview**: [https://plumber-c0vavbnwz-rees-projects-a5599142.vercel.app](https://plumber-c0vavbnwz-rees-projects-a5599142.vercel.app)
- **Production**: Coming soon

## 🎯 Features

### Currently Implemented ✅
- **Authentication System**
  - User registration with email verification
  - Secure login with session management
  - Password-protected accounts
  - Email confirmation workflow

- **Dashboard**
  - Overview of daily jobs
  - Customer statistics
  - Revenue tracking (in progress)
  - Quick action buttons

### Coming Soon 🚧
- Customer management (CRUD operations)
- Job scheduling and tracking
- Estimate creation and management
- Invoice generation and payment tracking
- Route optimization with Google Maps
- SMS/Email notifications
- Payment processing (Stripe & Square)
- Reporting and analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Payment Processing**: Stripe & Square (planned)
- **Communications**: Twilio (planned)
- **Maps**: Google Maps API (planned)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase CLI (for local development)
- Git

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ReesTindall/plumber-pro.git
cd plumber-pro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional (for future features)
GOOGLE_MAPS_API_KEY=your_google_maps_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public
```

### 4. Run local development
```bash
# Using the deployment script (recommended)
./deploy.sh local

# Or manually
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Access local services
- **Application**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Inbucket (Email testing)**: http://127.0.0.1:54324

## 📁 Project Structure

```
plumber-pro/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── login/        # Authentication pages
│   │   └── register/
│   └── components/       # React components
├── components/           # Shared components
├── lib/                  # Utility functions
├── types/               # TypeScript type definitions
├── supabase/           # Database migrations
├── public/             # Static assets
└── deploy.sh          # Deployment script
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Database migrations
npx supabase migration new <migration-name>
npx supabase db push

# Generate TypeScript types from database
npx supabase gen types typescript --local > types/database.ts
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)
```bash
./deploy.sh vercel
```

### Manual deployment
```bash
vercel --prod
```

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - Business accounts
- `customers` - Customer information
- `jobs` - Service jobs and appointments
- `estimates` - Job estimates
- `invoices` - Billing records
- `messages` - Communication logs

## 🔐 Security

- Row Level Security (RLS) implemented on all tables
- Service role key only used for admin operations
- Email verification required for new accounts
- Secure session management
- HTTPS enforced in production

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Documentation

- [Technical Specification](./TECH_SPEC.md)
- [API Routes Documentation](./current-api-routes.ts)
- [Development Progress](./progress.md)
- [Current Sprint](./SPRINT-CURRENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

- **Developer**: Rees Tindall
- **GitHub**: [ReesTindall](https://github.com/ReesTindall)

## 🆘 Support

For support, email support@plumberpro.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Current Version**: 0.1.0 (MVP in development)  
**Last Updated**: September 5, 2025