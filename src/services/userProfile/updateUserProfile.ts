
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile with drastically simplified logic and minimal timeout
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  if (!userId) {
    console.error("Missing userId in updateUserProfile");
    return { success: false, error: new Error("Missing userId") };
  }

  // Prepare the data for update
  const updateData: Record<string, any> = {};
  
  // Only allow certain fields
  const safeKeys = ['name', 'city', 'discovery_source', 'selected_actions', 'profile_completed'];
  
  // Simple validation
  Object.entries(data).forEach(([key, value]) => {
    if (safeKeys.includes(key) && value !== undefined) {
      updateData[key] = value;
    }
  });

  try {
    console.log("Updating profile with data:", updateData);
    
    // Attempt update with much shorter timeout to avoid UI freezes
    const { error } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }

    console.log("Profile updated successfully");
    return { success: true, error: null };
  } catch (err) {
    console.error("Exception during profile update:", err);
    return { success: false, error: err };
  }
};
