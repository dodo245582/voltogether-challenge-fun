
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
      (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state change event:", event);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Use setTimeout to prevent any potential deadlocks
          setTimeout(() => {
            if (mounted && event === 'SIGNED_IN') {
              console.log("Processing post-login tasks for user:", session.user.id);
              createUserProfileIfNotExists(session.user.id, session.user.email);
              fetchUserProfile(session.user.id);
            }
          }, 0);
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
        
        // Use setTimeout to prevent any deadlocks
        setTimeout(() => {
          if (mounted) {
            console.log("Processing existing session for user:", session.user.id);
            createUserProfileIfNotExists(session.user.id, session.user.email);
            fetchUserProfile(session.user.id);
          }
        }, 0);
      }
      
      // Always set loading to false regardless of session state
      setLoading(false);
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
      setLoading(true); // Set loading state during sign in
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setLoading(false); // Reset loading if there's an error
      }
      
      return { 
        error, 
        success: !error && !!data.session
      };
    } catch (error) {
      console.error("Exception in signIn:", error);
      setLoading(false); // Reset loading if there's an exception
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      setLoading(true);
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      await supabase.auth.signOut();
      
      setLoading(false);
      window.location.href = '/';
    } catch (error) {
      console.error("Exception in signOut:", error);
      setLoading(false);
      window.location.href = '/';
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
