
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Creates a user profile if it doesn't exist
 * Simplified with better error handling
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!userId || !email) {
    console.error("Missing userId or email in createUserProfileIfNotExists");
    return { success: false, error: new Error("Missing userId or email") };
  }

  try {
    console.log("Service: Checking if profile exists for:", userId);
    
    // First check if the profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error checking for existing profile:", fetchError);
      return { success: false, error: fetchError };
    }
    
    // If profile exists, return success
    if (existingProfile) {
      console.log("Service: Profile already exists for:", userId);
      return { 
        success: true, 
        data: existingProfile as UserType,
        message: 'Profile already exists' 
      };
    }
    
    console.log("Service: Creating new profile for:", userId);
    
    // Create a new profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('Users')
      .insert([
        { 
          id: userId, 
          email, 
          profile_completed: false,
          completed_challenges: 0,
          total_points: 0,
          streak: 0
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating profile:", createError);
      
      // If this was a duplicate error, the profile may have been created by another request
      if (createError.code === '23505') {
        console.log("Profile may have been created by another request, fetching...");
        const { data: retryProfile, error: retryError } = await supabase
          .from('Users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (retryError) {
          console.error("Error fetching profile after creation failure:", retryError);
          return { success: false, error: retryError };
        }
        
        if (retryProfile) {
          return { 
            success: true, 
            data: retryProfile as UserType,
            message: 'Profile found after creation attempt' 
          };
        }
      }
      
      return { success: false, error: createError };
    }
    
    console.log("Service: New profile created successfully");
    return { 
      success: true, 
      data: newProfile as UserType,
      message: 'Profile created successfully' 
    };
  } catch (error) {
    console.error("Exception in createUserProfileIfNotExists:", error);
    return { success: false, error };
  }
};
