export const config = {
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  isPreview: process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  features: {
    testMode: process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production',
    debugMode: process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview',
  },
  
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
  
  urls: {
    app: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 'https://app.plumberpro.com'
      : process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview'
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
  }
};