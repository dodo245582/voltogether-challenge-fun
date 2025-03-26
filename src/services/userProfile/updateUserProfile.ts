
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

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
