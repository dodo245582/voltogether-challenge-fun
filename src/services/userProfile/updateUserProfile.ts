
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile with extremely simplified error handling
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  if (!userId) {
    console.error("Missing userId in updateUserProfile");
    return { success: false, error: new Error("Missing userId") };
  }

  // Basic safety validation
  const cleanData: Record<string, any> = {};
  
  // Only allow certain fields to be updated
  const safeKeys = ['name', 'city', 'discovery_source', 'selected_actions', 'profile_completed'];
  
  // Basic validation of data
  Object.entries(data).forEach(([key, value]) => {
    if (safeKeys.includes(key) && value !== undefined) {
      // Additional safety for strings and arrays
      if (typeof value === 'string') {
        cleanData[key] = value.slice(0, 100); // Max 100 chars
      } else if (Array.isArray(value)) {
        cleanData[key] = value.slice(0, 20); // Max 20 items
      } else {
        cleanData[key] = value;
      }
    }
  });

  // Simple safety timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Update timeout")), 5000);
  });

  try {
    // Attempt update with timeout
    const updatePromise = supabase
      .from('Users')
      .update(cleanData)
      .eq('id', userId);
    
    const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Exception during profile update:", err);
    return { success: false, error: err };
  }
};
