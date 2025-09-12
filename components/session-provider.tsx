'use client';

import { useEffect, createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface SessionContextType {
  user: User | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({ user: null, loading: true });

export const useSession = () => useContext(SessionContext);

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    let isTabVisible = true;

    // Track tab visibility to avoid unnecessary auth checks
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (mounted) {
          setUser(user);
          setLoading(false);
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        // Only redirect if we're on a protected page
        if (window.location.pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setLoading(false);
        console.log('User signed in successfully');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUser(session.user);
        console.log('Token refreshed successfully');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [router, supabase]);

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}