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
    const status = url.searchParams.get('status');
    const date = url.searchParams.get('date');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('jobs')
      .select(`
        id,
        scheduled_date,
        time_window,
        type,
        status,
        notes,
        quick_customer,
        created_at,
        customers (
          id,
          name,
          address,
          phone,
          email
        )
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (date) {
      query = query.eq('scheduled_date', date);
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
    console.error('Jobs API error:', error);
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
    const { 
      customer_id, 
      quick_customer, 
      scheduled_date, 
      time_window, 
      type, 
      notes 
    } = body;

    // Validate required fields
    if (!scheduled_date || !time_window || !type) {
      const error = new AppError(
        'VALIDATION_ERROR',
        'Scheduled date, time window, and job type are required',
        400
      );
      const response = createApiResponse(null, error);
      return NextResponse.json(response, { status: error.statusCode });
    }

    // Must have either customer_id or quick_customer
    if (!customer_id && !quick_customer) {
      const error = new AppError(
        'VALIDATION_ERROR',
        'Either customer_id or quick_customer information is required',
        400
      );
      const response = createApiResponse(null, error);
      return NextResponse.json(response, { status: error.statusCode });
    }

    const jobData = {
      user_id: user.id,
      customer_id: customer_id || null,
      quick_customer: quick_customer || null,
      scheduled_date,
      time_window,
      type,
      notes: notes?.trim() || null,
      status: 'scheduled'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('jobs')
      .insert([jobData])
      .select(`
        id,
        scheduled_date,
        time_window,
        type,
        status,
        notes,
        quick_customer,
        created_at,
        customers (
          id,
          name,
          address,
          phone,
          email
        )
      `)
      .single();

    if (error) {
      const appError = handleSupabaseError(error);
      const response = createApiResponse(null, appError);
      return NextResponse.json(response, { status: appError.statusCode });
    }

    const response = createApiResponse(data);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Job creation error:', error);
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