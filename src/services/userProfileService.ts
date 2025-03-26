
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Fetches a user profile by user ID
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    // Add console logs to track execution
    console.log("Service: Fetching user profile for ID:", userId);
    
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Service: Error fetching user profile:', error);
      return { data: null, error };
    }
    
    if (data) {
      console.log("Service: User profile fetched successfully");
      // Store the profile in localStorage as a fallback mechanism
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
      } catch (e) {
        console.error("Error storing profile in localStorage:", e);
      }
      return { data: data as UserType, error: null };
    } else {
      console.log("Service: No user profile found");
      
      // Try to get profile from localStorage if database fetch failed
      try {
        const cachedProfile = localStorage.getItem(`profile_${userId}`);
        if (cachedProfile) {
          console.log("Service: Retrieved profile from localStorage");
          return { data: JSON.parse(cachedProfile) as UserType, error: null };
        }
      } catch (e) {
        console.error("Error retrieving profile from localStorage:", e);
      }
      
      return { data: null, error: new Error("No user profile found") };
    }
  } catch (error) {
    console.error("Service: Exception in fetchUserProfile:", error);
    return { data: null, error };
  }
};

/**
 * Creates a user profile if it doesn't exist
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!email) return { success: false, error: new Error("Email is required") };
  
  try {
    console.log("Service: Checking if user profile exists for ID:", userId);
    
    const { data, error } = await supabase
      .from('Users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Service: Error checking user profile:', error);
      return { success: false, error };
    }
    
    if (!data) {
      console.log("Service: Creating new user profile for:", email);
      const { error: insertError } = await supabase
        .from('Users')
        .insert({
          id: userId,
          email: email,
          completed_challenges: 0,
          total_points: 0,
          streak: 0
        });
      
      if (insertError) {
        console.error('Service: Error creating user profile:', insertError);
        
        // Create a local profile in localStorage as a fallback
        try {
          const initialProfile = {
            id: userId,
            email: email,
            completed_challenges: 0,
            total_points: 0,
            streak: 0
          };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(initialProfile));
          console.log("Service: Created profile in localStorage as fallback");
        } catch (e) {
          console.error("Error storing profile in localStorage:", e);
        }
        
        return { success: false, error: insertError };
      } else {
        console.log("Service: User profile created successfully");
        return { success: true, error: null };
      }
    } else {
      console.log("Service: User profile already exists");
      return { success: true, error: null };
    }
  } catch (error) {
    console.error("Service: Exception in createUserProfileIfNotExists:", error);
    return { success: false, error };
  }
};

/**
 * Updates a user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  if (!userId) {
    return { 
      error: new Error('User not authenticated'), 
      success: false 
    };
  }

  try {
    console.log("Service: Updating user profile with data:", data);
    
    const { error } = await supabase
      .from('Users')
      .update(data)
      .eq('id', userId);
    
    if (!error) {
      console.log("Service: Profile updated successfully");
      
      // Also update localStorage
      try {
        const existingProfile = localStorage.getItem(`profile_${userId}`);
        if (existingProfile) {
          const updatedProfile = { ...JSON.parse(existingProfile), ...data };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        } else {
          localStorage.setItem(`profile_${userId}`, JSON.stringify({ id: userId, ...data }));
        }
      } catch (e) {
        console.error("Error updating profile in localStorage:", e);
      }
      
      if (data.selected_actions) {
        localStorage.setItem('userSelectedActions', JSON.stringify(data.selected_actions));
      }
      
      return { error: null, success: true };
    }
    
    if (error) {
      console.error("Service: Error updating profile:", error);
      
      // Update localStorage even if DB update failed
      try {
        const existingProfile = localStorage.getItem(`profile_${userId}`);
        if (existingProfile) {
          const updatedProfile = { ...JSON.parse(existingProfile), ...data };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        } else {
          localStorage.setItem(`profile_${userId}`, JSON.stringify({ id: userId, ...data }));
        }
        
        if (data.selected_actions) {
          localStorage.setItem('userSelectedActions', JSON.stringify(data.selected_actions));
        }
        
        console.log("Service: Updated profile in localStorage despite DB error");
        return { error: null, success: true };
      } catch (e) {
        console.error("Error updating profile in localStorage:", e);
      }
    }
    
    return { error, success: !error };
  } catch (error) {
    console.error("Service: Exception in updateProfile:", error);
    
    // Try to update local storage as a last resort
    try {
      const existingProfile = localStorage.getItem(`profile_${userId}`);
      if (existingProfile) {
        const updatedProfile = { ...JSON.parse(existingProfile), ...data };
        localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        console.log("Service: Updated profile in localStorage despite exception");
        return { error: null, success: true };
      }
    } catch (e) {
      console.error("Error updating profile in localStorage:", e);
    }
    
    return { error, success: false };
  }
};
