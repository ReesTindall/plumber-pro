'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        // Only redirect if we're on a protected page
        if (window.location.pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Don't use router.refresh() as it can cause issues
        console.log('User signed in successfully');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <>{children}</>;
}