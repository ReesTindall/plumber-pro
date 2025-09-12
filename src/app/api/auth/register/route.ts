import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { handleSupabaseError, createApiResponse, AppError, ErrorCodes } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { userId, email, businessName, phone } = await request.json();

    // Validate required fields
    if (!userId || !email || !businessName) {
      const error = new AppError(
        ErrorCodes.BIZ_INVALID_JOB_STATUS,
        'Missing required fields: userId, email, and businessName are required',
        400
      );
      const response = createApiResponse(null, error);
      return NextResponse.json(response, { status: error.statusCode });
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user profile with service role to bypass RLS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('users')
      .insert([{
        id: userId,
        email: email,
        business_name: businessName,
        phone: phone || null,
        invoice_template: 'classic',
        default_tax_rate: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      const appError = handleSupabaseError(error);
      const response = createApiResponse(null, appError);
      return NextResponse.json(response, { status: appError.statusCode });
    }

    const response = createApiResponse(data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Registration API error:', error);
    const appError = new AppError(
      'INTERNAL_ERROR',
      'Internal server error',
      500,
      error
    );
    const response = createApiResponse(null, appError);
    return NextResponse.json(response, { status: appError.statusCode });
  }
}