'use client';

import { useEffect, createContext, useContext, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface SessionContextType {
  user: User | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({ user: null, loading: true });

export const useSession = () => useContext(SessionContext);

// Check if multiple tabs are open
const checkMultipleTabs = () => {
  const tabId = sessionStorage.getItem('tabId') || Math.random().toString(36);
  sessionStorage.setItem('tabId', tabId);
  
  const existingTabs = JSON.parse(localStorage.getItem('openTabs') || '[]');
  const currentTime = Date.now();
  
  // Clean up old tabs (older than 5 seconds)
  const activeTabs = existingTabs.filter((tab: { id: string; timestamp: number }) => currentTime - tab.timestamp < 5000);
  
  // Add current tab
  const updatedTabs = activeTabs.filter((tab: { id: string; timestamp: number }) => tab.id !== tabId);
  updatedTabs.push({ id: tabId, timestamp: currentTime });
  localStorage.setItem('openTabs', JSON.stringify(updatedTabs));
  
  return updatedTabs.length > 1;
};

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [multipleTabsOpen, setMultipleTabsOpen] = useState(false);

  // Check for multiple tabs
  useEffect(() => {
    const hasMultipleTabs = checkMultipleTabs();
    setMultipleTabsOpen(hasMultipleTabs);

    // Update tab activity every 2 seconds
    const interval = setInterval(() => {
      const stillHasMultipleTabs = checkMultipleTabs();
      setMultipleTabsOpen(stillHasMultipleTabs);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Simple session check
    const getSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Add a small delay only when coming from error pages or initial load
    const isFromError = pathname === '/not-found' || !pathname || pathname === '/';
    const delay = isFromError ? 100 : 0;
    
    setTimeout(() => {
      if (mounted) {
        getSession();
      }
    }, delay);

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
    };
  }, [router, supabase, pathname]);

  // Show multiple tabs warning
  if (multipleTabsOpen) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Multiple Tabs Detected</h2>
            <p className="text-gray-600 mb-6">
              Please close other open tabs to use PlumberPro. Multiple tabs can cause authentication issues.
            </p>
          </div>
          
          <button
            onClick={() => {
              // Clear all tabs and refresh
              localStorage.removeItem('openTabs');
              sessionStorage.removeItem('tabId');
              window.location.reload();
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue (Close Other Tabs First)
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            This helps ensure a stable experience with your plumbing business data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}