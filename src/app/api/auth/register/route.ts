import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, email, businessName, phone } = await request.json();

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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}