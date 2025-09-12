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

  useEffect(() => {
    let mounted = true;

    // Get initial session and validate it
    const getSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.log('Session error:', error.message);
          // Clear invalid session
          await supabase.auth.signOut();
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (user) {
          // Validate the session by making a simple API call
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: profileError } = await (supabase as any)
              .from('users')
              .select('id')
              .eq('id', user.id)
              .limit(1);
            
            if (profileError && profileError.message.includes('JWT')) {
              console.log('Session validation failed, clearing session');
              await supabase.auth.signOut();
              if (mounted) {
                setUser(null);
                setLoading(false);
              }
              return;
            }
          } catch (validationError) {
            console.log('Session validation error:', validationError);
            await supabase.auth.signOut();
            if (mounted) {
              setUser(null);
              setLoading(false);
            }
            return;
          }
        }

        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        // Clear potentially corrupt session
        await supabase.auth.signOut();
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
        // Only redirect if we're on a protected page
        if (window.location.pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        console.log('User signed in successfully');
      } else if (event === 'TOKEN_REFRESHED' && session) {
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