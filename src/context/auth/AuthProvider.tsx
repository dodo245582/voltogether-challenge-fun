import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { User as UserType } from '@/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    profile, 
    fetchUserProfile,
    createUserProfileIfNotExists, 
    updateProfile: updateUserProfile,
    setProfile
  } = useUserProfile();

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state change event:", event);
        
        if (session?.user) {
          // Set user and session immediately
          setSession(session);
          setUser(session.user);
          setLoading(false);
          
          // Fetch profile in the background without blocking UI
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              if (mounted) {
                createUserProfileIfNotExists(session.user.id, session.user.email);
                fetchUserProfile(session.user.id);
              }
            }, 0);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Got existing session:", !!session);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
        
        // Fetch profile in background without blocking UI
        setTimeout(() => {
          if (mounted) {
            createUserProfileIfNotExists(session.user.id, session.user.email);
            fetchUserProfile(session.user.id);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, createUserProfileIfNotExists, setProfile]);

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (!error && data.user) {
        console.log("Signup successful, creating initial profile:", data.user.id);
        setTimeout(async () => {
          await createUserProfileIfNotExists(data.user!.id, data.user!.email);
        }, 0);
      }
      
      return { 
        error, 
        success: !error && !!data.user
      };
    } catch (error) {
      console.error("Exception in signUp:", error);
      return { error, success: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { 
        error, 
        success: !error && !!data.session
      };
    } catch (error) {
      console.error("Exception in signIn:", error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      // Pulire lo stato locale prima di effettuare il logout
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Pulire i dati di reindirizzamento per evitare loop dopo il logout
      sessionStorage.removeItem('onboardingRedirectAttempted');
      sessionStorage.removeItem('redirectFromOnboarding');
      localStorage.removeItem('totalPoints');
      localStorage.removeItem('completedChallenges');
      localStorage.removeItem('streak');
      localStorage.removeItem('userSelectedActions');
      
      // Solo ora effettuare il logout da Supabase
      await supabase.auth.signOut();
      
      // Reindirizzamento sicuro alla home page
      const baseUrl = window.location.origin;
      window.location.href = baseUrl;
    } catch (error) {
      console.error("Exception in signOut:", error);
    }
  };

  const updateProfile = async (data: Partial<UserType>) => {
    if (!user) {
      return { 
        error: new Error('User not authenticated'), 
        success: false 
      };
    }
    
    console.log("Updating profile with data:", data);
    const result = await updateUserProfile(user.id, data);
    
    if (result.success) {
      console.log("Profile update successful, refreshing profile data");
      setTimeout(async () => {
        await fetchUserProfile(user.id);
      }, 0);
    }
    
    return result;
  };

  const refreshProfile = async (userId: string) => {
    if (!userId) return;
    console.log("AuthProvider: Refreshing profile for user:", userId);
    return fetchUserProfile(userId);
  };

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
