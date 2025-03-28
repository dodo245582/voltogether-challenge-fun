
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  const { 
    fetchUserProfile,
    createUserProfileIfNotExists,
    setProfile
  } = useUserProfile();

  useEffect(() => {
    console.log("useAuthState: Initializing auth state");
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state change event:", event);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          setSession(session);
          setUser(session.user);
          
          // For certain events, run post-login tasks but don't block UI
          if (mounted && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // Only trigger background operations, don't block the UI flow
            setTimeout(() => {
              if (!mounted) return;
              Promise.all([
                createUserProfileIfNotExists(session.user.id, session.user.email),
                fetchUserProfile(session.user.id)
              ]).catch(error => {
                console.error("Error in post-login tasks:", error);
              });
            }, 0);
          }
        } else {
          console.log("No authenticated user");
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        // Always set loading false
        setLoading(false);
      }
    );

    // Initial session check - prioritize speed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Got existing session:", !!session);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        
        // Update auth initialized immediately for faster route decisions
        setAuthInitialized(true);
        
        // Check for cached profile immediately
        try {
          const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
            setLoading(false);
          }
        } catch (e) {
          console.error("Error accessing cached profile:", e);
        }
        
        // Fetch/create profile in background without blocking the UI
        setTimeout(() => {
          if (!mounted) return;
          Promise.all([
            createUserProfileIfNotExists(session.user.id, session.user.email),
            fetchUserProfile(session.user.id)
          ])
          .catch(err => {
            console.error("Error initializing user profile:", err);
          })
          .finally(() => {
            if (mounted) {
              setLoading(false);
            }
          });
        }, 0);
      } else {
        setAuthInitialized(true);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, createUserProfileIfNotExists, setProfile]);

  return {
    session,
    user,
    loading,
    authInitialized
  };
};
