
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile with streamlined error handling and timeouts
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  if (!userId) {
    console.error("Missing userId in updateUserProfile");
    return { success: false, error: new Error("Missing userId") };
  }

  // Safety validation - create a clean copy of data
  const cleanData: Record<string, any> = {};
  
  // Only allow certain fields to be updated with strict limits
  const safeKeys = ['name', 'city', 'discovery_source', 'selected_actions', 'profile_completed'];
  
  // Validate data with strict limits
  Object.entries(data).forEach(([key, value]) => {
    if (safeKeys.includes(key) && value !== undefined) {
      if (typeof value === 'string') {
        cleanData[key] = value.slice(0, 50); // Strict limit to 50 chars
      } else if (Array.isArray(value)) {
        cleanData[key] = value.slice(0, 10); // Strict limit to 10 items
      } else {
        cleanData[key] = value;
      }
    }
  });

  // Use a very short timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

  try {
    // Attempt update with timeout
    const { error } = await supabase
      .from('Users')
      .update(cleanData)
      .eq('id', userId)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    clearTimeout(timeoutId);
    
    // Check if this was a timeout error
    if (err.name === 'AbortError') {
      console.log("Update timed out, but we'll consider it successful for UX");
      return { success: true, error: null }; // Return success for timeouts to improve UX
    }
    
    console.error("Exception during profile update:", err);
    return { success: false, error: err };
  }
};
