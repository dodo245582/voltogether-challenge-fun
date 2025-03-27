
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User as UserType } from '@/types';

export const useAuthMethods = (user: User | null) => {
  const [loading, setLoading] = useState(false);
  const { 
    fetchUserProfile,
    createUserProfileIfNotExists, 
    updateUserProfile: updateUserProfileHook,
  } = useUserProfile();

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up user:", email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (!error && data.user) {
        console.log("Signup successful for user ID:", data.user.id);
        
        try {
          // Create profile immediately after registration
          const profileResult = await createUserProfileIfNotExists(data.user.id, data.user.email);
          console.log("Profile creation result:", profileResult);
          
          // Load the profile
          await fetchUserProfile(data.user.id);
        } catch (err) {
          console.error("Error creating user profile after signup:", err);
        }
      } else if (error) {
        console.error("Signup error:", error);
        setLoading(false);
      }
      
      return { 
        error, 
        success: !error && !!data.user
      };
    } catch (error) {
      console.error("Exception in signUp:", error);
      setLoading(false);
      return { error, success: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      setLoading(true); 
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        setLoading(false);
      } else if (data.user) {
        console.log("Sign in successful for user ID:", data.user.id);
        
        try {
          // Create/verify profile immediately
          await createUserProfileIfNotExists(data.user.id, data.user.email);
        } catch (err) {
          console.error("Error ensuring profile exists:", err);
        }
      }
      
      return { 
        error, 
        success: !error && !!data.session
      };
    } catch (error) {
      console.error("Exception in signIn:", error);
      setLoading(false);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      setLoading(true);
      
      // Clear local storage and session storage
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
    const result = await updateUserProfileHook(user.id, data);
    
    if (result.success) {
      console.log("Profile update successful, refreshing profile data");
      setTimeout(async () => {
        await fetchUserProfile(user.id);
      }, 0);
    }
    
    return result;
  };

  const refreshProfile = async (userId: string) => {
    if (!userId) return { success: false, error: "No user ID provided" };
    console.log("AuthProvider: Refreshing profile for user:", userId);
    
    try {
      const result = await fetchUserProfile(userId);
      return { success: !!result, error: result ? null : "Failed to fetch profile" };
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return { success: false, error: error?.message || "Unknown error" };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    loading
  };
};
