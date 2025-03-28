
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

    // Set up auth state listener - highest priority
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state change event:", event);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          setSession(session);
          setUser(session.user);
          
          // For SIGNED_IN and TOKEN_REFRESHED - only fetch cached data first
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Try to load cached profile immediately
            try {
              const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
              if (cachedProfile) {
                setProfile(JSON.parse(cachedProfile));
              }
            } catch (e) {
              console.error("Error accessing cached profile:", e);
            }
            
            // Run other operations in background, completely non-blocking
            setTimeout(() => {
              if (!mounted) return;
              Promise.all([
                createUserProfileIfNotExists(session.user.id, session.user.email),
                fetchUserProfile(session.user.id)
              ]).catch(err => {
                console.error("Background profile operations error:", err);
              });
            }, 0);
          }
        } else {
          console.log("No authenticated user");
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        // Always update loading state
        setLoading(false);
      }
    );

    // Initial session check - highest priority for speed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Got existing session:", !!session);
      
      if (session?.user) {
        // Set auth state immediately
        setSession(session);
        setUser(session.user);
        setAuthInitialized(true);
        
        // Check for cached profile - faster than database
        let hasCache = false;
        try {
          const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
            setLoading(false);
            hasCache = true;
          }
        } catch (e) {
          console.error("Error accessing cached profile:", e);
        }
        
        // Background tasks - completely non-blocking
        setTimeout(() => {
          if (!mounted) return;
          Promise.all([
            createUserProfileIfNotExists(session.user.id, session.user.email),
            fetchUserProfile(session.user.id)
          ])
          .catch(err => {
            console.error("Background profile operations error:", err);
          })
          .finally(() => {
            if (mounted) {
              setLoading(false);
            }
          });
        }, 0);
      } else {
        // No user - finish immediately
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
