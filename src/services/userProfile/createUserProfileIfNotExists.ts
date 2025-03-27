
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Creates a user profile if it doesn't exist
 * Fixed to properly handle the database constraints
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!userId || !email) {
    console.error("Missing userId or email in createUserProfileIfNotExists");
    return { success: false, error: new Error("Missing userId or email") };
  }

  try {
    console.log("Service: Checking if profile exists for:", userId);
    
    // First check if there's a cached profile in localStorage
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        // If there's a profile in cache, update it in background without blocking
        setTimeout(() => {
          checkAndCreateProfileInDb(userId, email);
        }, 0);
        
        return { 
          success: true, 
          data: JSON.parse(cachedProfile) as UserType,
          message: 'Using cached profile while verifying in database' 
        };
      }
    } catch (e) {
      console.error("Error checking localStorage:", e);
    }
    
    return await checkAndCreateProfileInDb(userId, email);
  } catch (error) {
    console.error("Exception in createUserProfileIfNotExists:", error);
    return { success: false, error };
  }
};

/**
 * Helper function to check and create profile in database
 * Fixed to properly handle the password field constraint
 */
async function checkAndCreateProfileInDb(userId: string, email: string) {
  try {
    // Verify if the profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error checking for existing profile:", fetchError);
      return { success: false, error: fetchError };
    }
    
    // If it exists already, return the profile
    if (existingProfile) {
      console.log("Service: Profile already exists for:", userId);
      
      // Update the cache
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(existingProfile));
      } catch (e) {
        console.error("Error updating localStorage:", e);
      }
      
      return { 
        success: true, 
        data: existingProfile as UserType,
        message: 'Profile already exists' 
      };
    }
    
    console.log("Service: Creating new profile for:", userId);
    
    // Create a new profile - FIXED: generated a random password string to avoid constraint violations
    const randomPassword = Math.random().toString(36).substring(2, 15);
    
    const { data: newProfile, error: createError } = await supabase
      .from('Users')
      .insert([
        { 
          id: userId, 
          email, 
          password: randomPassword, // Using random string to avoid constraint issues
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
      
      // If there's a duplication error, it might have been created by another request
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
          // Update the cache
          try {
            localStorage.setItem(`profile_${userId}`, JSON.stringify(retryProfile));
          } catch (e) {
            console.error("Error updating localStorage:", e);
          }
          
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
    
    // Update the cache with the new profile
    try {
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
    } catch (e) {
      console.error("Error updating localStorage:", e);
    }
    
    return { 
      success: true, 
      data: newProfile as UserType,
      message: 'Profile created successfully' 
    };
  } catch (error) {
    console.error("Error in checkAndCreateProfileInDb:", error);
    return { success: false, error };
  }
}
