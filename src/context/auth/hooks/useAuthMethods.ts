
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

export const useAuthMethods = (
  user: User | null, 
  setProfile: (profile: UserType | null) => void
) => {
  const [loading, setLoading] = useState(false);

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
          // Create profile immediately
          const { data: profile, error: profileError } = await supabase
            .from('Users')
            .insert([
              { 
                id: data.user.id, 
                email: data.user.email, 
                password: Math.random().toString(36).substring(2, 15),
                profile_completed: false,
                completed_challenges: 0,
                total_points: 0,
                streak: 0
              }
            ])
            .select()
            .single();
            
          if (profile && !profileError) {
            // Update local state and cache
            setProfile(profile);
            localStorage.setItem(`profile_${data.user.id}`, JSON.stringify(profile));
          }
        } catch (err) {
          console.error("Error creating user profile:", err);
          // Continue anyway - don't block the flow
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
    try {
      setLoading(true);
      
      // Update local cache and state immediately for faster UI updates
      if (user.id) {
        try {
          const cachedProfile = localStorage.getItem(`profile_${user.id}`);
          if (cachedProfile) {
            const updatedProfile = { ...JSON.parse(cachedProfile), ...data };
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
            setProfile(updatedProfile);
          }
        } catch (e) {
          console.error("Error updating cache:", e);
        }
      }
      
      // Update database
      const { error } = await supabase
        .from('Users')
        .update(data)
        .eq('id', user.id);
      
      setLoading(false);
      
      if (error) {
        console.error("Error updating profile:", error);
        return { error, success: false };
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error("Exception in updateProfile:", error);
      setLoading(false);
      return { error, success: false };
    }
  };

  const refreshProfile = async (userId: string) => {
    if (!userId) return { success: false, error: "No user ID provided" };
    
    try {
      // Check cache first for immediate response
      try {
        const cachedProfile = localStorage.getItem(`profile_${userId}`);
        if (cachedProfile) {
          const profileData = JSON.parse(cachedProfile);
          setProfile(profileData);
          
          // Background fetch for fresh data
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('Users')
                .select('*')
                .eq('id', userId)
                .single();
                
              if (data && !error) {
                localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
                setProfile(data);
              }
            } catch (e) {
              console.error("Background refresh error:", e);
            }
          }, 10);
          
          return { success: true, error: null };
        }
      } catch (e) {
        console.error("Cache check error:", e);
      }
      
      // If no cache, do a direct fetch
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error refreshing profile:", error);
        return { success: false, error: error.message };
      }
      
      if (data) {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
        setProfile(data);
      }
      
      return { success: !!data, error: data ? null : "Profile not found" };
    } catch (error) {
      console.error("Exception in refreshProfile:", error);
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
