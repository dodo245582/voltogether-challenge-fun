
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile with optimized logic and proper error handling
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  if (!userId) {
    console.error("Missing userId in updateUserProfile");
    return { success: false, error: new Error("Missing userId") };
  }

  // Log what data we're trying to update
  console.log("Starting user profile update for ID:", userId);
  console.log("Data to update:", data);

  // Prepare the data for update
  const updateData: Record<string, any> = {};
  
  // Allow all valid profile fields
  const safeKeys = [
    'name', 
    'city', 
    'discovery_source', 
    'selected_actions', 
    'profile_completed',
    'completed_challenges',
    'total_points',
    'streak'
  ];
  
  // Simple validation to ensure we only update valid fields
  Object.entries(data).forEach(([key, value]) => {
    if (safeKeys.includes(key) && value !== undefined) {
      updateData[key] = value;
    }
  });

  console.log("Sanitized update data:", updateData);

  try {
    // Verify we have data to update
    if (Object.keys(updateData).length === 0) {
      console.warn("No valid data to update for user:", userId);
      return { success: false, error: new Error("No valid data to update") };
    }
    
    // Attempt update with Supabase
    const { error, data: response } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error("Error updating profile in Supabase:", error);
      return { success: false, error };
    }

    console.log("Profile updated successfully in Supabase:", response);
    return { success: true, error: null };
  } catch (err) {
    console.error("Exception during profile update in Supabase:", err);
    return { success: false, error: err };
  }
};
