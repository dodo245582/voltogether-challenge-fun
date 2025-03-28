
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log("useAuthState: Initializing auth state");
    let mounted = true;

    // Helper function to process auth - non-blocking
    const processAuthChange = (newSession: Session | null) => {
      if (!mounted) return;
      
      if (newSession?.user) {
        console.log("User authenticated:", newSession.user.email);
        
        // Set auth state immediately to prevent flicker
        setSession(newSession);
        setUser(newSession.user);
        setAuthInitialized(true);
        
        // Try to load cached profile immediately
        try {
          const cachedProfile = localStorage.getItem(`profile_${newSession.user.id}`);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
            
            // Cached profile means basic state is ready
            setLoading(false);
          }
        } catch (e) {
          console.error("Error accessing cached profile:", e);
        }
      } else {
        console.log("No authenticated user");
        setSession(null);
        setUser(null);
        setProfile(null);
        setAuthInitialized(true);
        setLoading(false);
      }
    };

    // Set up auth state listener - highest priority
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        processAuthChange(session);
        
        // Background fetch for non-cached updates (completely non-blocking)
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const { data: profile } = await supabase
                .from('Users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              if (profile && mounted) {
                // Update cache and state
                localStorage.setItem(`profile_${session.user.id}`, JSON.stringify(profile));
                setProfile(profile);
                setLoading(false);
              }
            } catch (err) {
              console.error("Background profile check error:", err);
            }
          }, 10);
        }
      }
    );

    // Initial session check - highest priority for speed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      processAuthChange(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    profile,
    loading,
    authInitialized,
    setProfile
  };
};
