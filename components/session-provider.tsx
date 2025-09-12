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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          // Only redirect if we're on a protected page
          if (window.location.pathname.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}