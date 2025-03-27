
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  if (!userId) {
    console.error("Service: Cannot update profile - user ID is missing");
    return { 
      error: new Error('User not authenticated'), 
      success: false 
    };
  }

  try {
    console.log("Service: Updating user profile with data:", data);
    console.log("Service: User ID being used:", userId);
    
    // Check if profile exists first
    const { data: existingProfile } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (!existingProfile) {
      console.log("Profile does not exist, creating it first");
      // If profile doesn't exist yet, we need to create it first with all user data
      const createData = {
        id: userId,
        ...data,
        // Ensure these fields have default values if not provided
        total_points: data.total_points || 0,
        completed_challenges: data.completed_challenges || 0,
        streak: data.streak || 0
      };
      
      const { error: insertError } = await supabase
        .from('Users')
        .insert(createData);
        
      if (insertError) {
        console.error("Service: Error creating profile during update:", insertError);
        
        if (insertError.code === '42501') {
          console.error("RLS policy violation - make sure user is authenticated");
        }
        
        // Also update localStorage even if DB insert failed
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(createData));
          console.log("Service: Updated profile in localStorage despite DB error");
        } catch (e) {
          console.error("Error updating profile in localStorage:", e);
        }
      } else {
        console.log("Service: Profile created successfully during update operation");
      }
      
      return { error: insertError, success: !insertError };
    }
    
    // Update existing profile
    const { error, data: updatedData } = await supabase
      .from('Users')
      .update(data)
      .eq('id', userId)
      .select();
    
    if (!error) {
      console.log("Service: Profile updated successfully in database", updatedData);
      
      // Also update localStorage
      try {
        const existingCacheStr = localStorage.getItem(`profile_${userId}`);
        if (existingCacheStr) {
          const updatedProfile = { ...JSON.parse(existingCacheStr), ...data };
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
        const existingCacheStr = localStorage.getItem(`profile_${userId}`);
        if (existingCacheStr) {
          const updatedProfile = { ...JSON.parse(existingCacheStr), ...data };
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
      const existingCacheStr = localStorage.getItem(`profile_${userId}`);
      if (existingCacheStr) {
        const updatedProfile = { ...JSON.parse(existingCacheStr), ...data };
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
