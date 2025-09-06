'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function createUserProfile(userId: string, email: string, businessName: string, phone: string | null) {
  // Create a service role client for admin operations
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{
      id: userId,
      email: email,
      business_name: businessName,
      phone: phone,
      invoice_template: 'classic',
      default_tax_rate: 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Profile creation error:', error);
    return { error: error.message };
  }

  return { data };
}