
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  console.log("Updating profile for userId:", userId, "with data:", data);

  if (!userId) {
    console.error("Missing userId in updateUserProfile");
    return { success: false, error: new Error("Missing userId") };
  }

  try {
    // Create a clean data object without any undefined values
    const cleanData: Record<string, any> = {};
    
    // Only include defined values
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    
    console.log("Clean data for update:", cleanData);

    // Simple validation to prevent errors
    if (Object.keys(cleanData).length === 0) {
      console.log("No valid data to update");
      return { success: true, error: null }; // Not an error, just nothing to do
    }

    const { error } = await supabase
      .from('Users')
      .update(cleanData)
      .eq('id', userId);

    if (error) {
      console.error("Error updating profile in Supabase:", error);
      return { success: false, error };
    }

    console.log("Profile successfully updated in Supabase");
    return { success: true, error: null };
  } catch (err) {
    console.error("Exception during profile update:", err);
    return { success: false, error: err };
  }
};
