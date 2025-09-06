'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        router.refresh();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        router.refresh();
      } else if (event === 'USER_UPDATED') {
        router.refresh();
      }
    });

    // Check session on mount
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session && window.location.pathname.startsWith('/dashboard')) {
        console.log('No session found, redirecting to login');
        router.push('/login');
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <>{children}</>;
}