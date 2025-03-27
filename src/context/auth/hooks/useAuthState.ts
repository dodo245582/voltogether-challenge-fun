
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
          
          if (mounted && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            console.log("Processing post-login tasks for user:", session.user.id);
            // Execute operations in parallel instead of sequence
            Promise.all([
              createUserProfileIfNotExists(session.user.id, session.user.email),
              fetchUserProfile(session.user.id)
            ]).catch(error => {
              console.error("Error in post-login tasks:", error);
            });
          }
        } else {
          console.log("No authenticated user");
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        // Always ensure loading is set to false after auth state is updated
        setLoading(false);
      }
    );

    // Check for existing session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Got existing session:", !!session);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        
        // Optimization: execute operations in parallel
        Promise.all([
          createUserProfileIfNotExists(session.user.id, session.user.email),
          fetchUserProfile(session.user.id)
        ])
        .catch(err => {
          console.error("Error initializing user profile:", err);
        })
        .finally(() => {
          if (mounted) {
            setAuthInitialized(true);
            setLoading(false);
          }
        });
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
