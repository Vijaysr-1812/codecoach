'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  current_skill_level: 'Beginner' | 'Medium' | 'Expert';
  streak_count: number;
  total_problems: number;
  last_active_date: string | null;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#020817' }}>
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, current_skill_level, streak_count, total_problems, last_active_date')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!session?.user) return;
    const p = await fetchProfile(session.user.id);
    setProfile(p);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);

        if (_event === 'SIGNED_IN' && newSession) {
          setTimeout(() => {
            fetchProfile(newSession.user.id).then(setProfile);
          }, 0);
        }

        if (_event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};
