import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleSupabaseError, createApiResponse, AppError, ErrorCodes } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const error = new AppError(
        ErrorCodes.AUTH_UNAUTHORIZED,
        'Authentication required',
        401
      );
      const response = createApiResponse(null, error);
      return NextResponse.json(response, { status: error.statusCode });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const archived = url.searchParams.get('archived') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('customers')
      .select('id, name, address, phone, email, created_at')
      .eq('user_id', user.id)
      .eq('archived', archived)
      .order('name')
      .limit(limit);

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      const appError = handleSupabaseError(error);
      const response = createApiResponse(null, appError);
      return NextResponse.json(response, { status: appError.statusCode });
    }

    const response = createApiResponse(data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Customers API error:', error);
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const error = new AppError(
        ErrorCodes.AUTH_UNAUTHORIZED,
        'Authentication required',
        401
      );
      const response = createApiResponse(null, error);
      return NextResponse.json(response, { status: error.statusCode });
    }

    const body = await request.json();
    const { name, address, phone, email, notes } = body;

    // Validate required fields
    if (!name || !address) {
      const error = new AppError(
        'VALIDATION_ERROR',
        'Name and address are required',
        400
      );
      const response = createApiResponse(null, error);
      return NextResponse.json(response, { status: error.statusCode });
    }

    const customerData = {
      user_id: user.id,
      name: name.trim(),
      address: address.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      notes: notes?.trim() || null,
      archived: false
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      const appError = handleSupabaseError(error);
      const response = createApiResponse(null, appError);
      return NextResponse.json(response, { status: appError.statusCode });
    }

    const response = createApiResponse(data);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Customer creation error:', error);
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