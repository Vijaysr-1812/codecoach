'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react'; // Import a loading icon

// Define the shape of your profile data
interface Profile {
  username: string;
  // Add other profile fields here, e.g., avatar_url
}

// Define the context shape
interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple loading component to show while auth is checking
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#020817' /* This is a common Tailwind 'bg-background' dark color */ }}>
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get the initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      // If there's a session, fetch the user's profile
      if (session) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        // If the user logs in, fetch their profile
        if (_event === 'SIGNED_IN' && session) {
          setLoading(true); // Show loading while fetching new profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
          setLoading(false); // Done fetching
        }

        // If the user logs out, clear the profile
        if (_event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    profile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Show loading spinner while checking auth, then show the app */}
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider> 
  );
};