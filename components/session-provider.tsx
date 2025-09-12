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

// Global session state to prevent re-initialization
let globalUser: User | null = null;
let globalLoading = true;
let globalInitialized = false;

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState<boolean>(globalLoading);

  useEffect(() => {
    let mounted = true;

    // If already initialized, use global state
    if (globalInitialized) {
      setUser(globalUser);
      setLoading(false);
      return;
    }

    // Initial session check
    const getSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (mounted) {
          globalUser = user;
          globalLoading = false;
          globalInitialized = true;
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          globalUser = null;
          globalLoading = false;
          globalInitialized = true;
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
        globalUser = null;
        setUser(null);
        setLoading(false);
        // Only redirect if we're on a protected page
        if (window.location.pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } else if (event === 'SIGNED_IN' && session) {
        globalUser = session.user;
        setUser(session.user);
        setLoading(false);
        console.log('User signed in successfully');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        globalUser = session.user;
        setUser(session.user);
        console.log('Token refreshed successfully');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}