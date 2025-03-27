
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Creates a user profile if one doesn't already exist
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!userId || !email) {
    console.error("Missing required parameters: userId and email must be provided");
    return { 
      success: false, 
      error: new Error("User ID and email are required"), 
      existing: false 
    };
  }

  console.log("Checking/creating profile for user:", userId);

  try {
    // First check if profile exists in local storage
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        console.log("Found profile in localStorage, checking if it exists in database");
        const profileData = JSON.parse(cachedProfile);
        
        // Verify against database
        const { data: existingProfile, error: fetchError } = await supabase
          .from('Users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (existingProfile) {
          console.log("Profile exists in database");
          return { 
            success: true, 
            data: existingProfile as UserType, 
            error: null,
            existing: true 
          };
        }
      }
    } catch (e) {
      console.error("Error checking localStorage:", e);
      // Continue with creation
    }

    // Try the edge function to create the profile
    try {
      console.log("Calling edge function to create profile");
      const response = await supabase.functions.invoke('create-user-profile-function', {
        body: { userId, email },
      });

      if (response.error) {
        throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
      }

      const result = response.data;
      
      if (result.success) {
        console.log("Profile created successfully via edge function:", result.data);
        
        // Update localStorage cache
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(result.data));
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
        
        return { 
          success: true, 
          data: result.data as UserType, 
          error: null,
          existing: result.existing || false
        };
      } else {
        console.error("Edge function unsuccessful:", result);
        throw new Error(result.message || "Unknown error creating profile via edge function");
      }
    } catch (edgeFunctionError) {
      console.error("Error using edge function, falling back to direct insert:", edgeFunctionError);
      
      // Fallback: Try direct insert (may fail due to RLS)
      const { data: insertData, error: insertError } = await supabase
        .from('Users')
        .insert({
          id: userId,
          email: email,
          completed_challenges: 0,
          total_points: 0,
          streak: 0,
          profile_completed: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile via direct insert:", insertError);
        
        // Create a minimal local profile for offline functionality
        const fallbackProfile = {
          id: userId,
          email: email,
          completed_challenges: 0,
          total_points: 0,
          streak: 0,
          profile_completed: false,
        };
        
        // Store the fallback profile in localStorage
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(fallbackProfile));
          console.log("Created fallback profile in localStorage");
        } catch (e) {
          console.error("Error creating fallback profile in localStorage:", e);
        }
        
        return { 
          success: false, 
          error: insertError, 
          data: fallbackProfile as UserType,
          existing: false,
          fallback: true
        };
      }

      console.log("Profile created successfully via direct insert:", insertData);
      
      // Update localStorage cache
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(insertData));
      } catch (e) {
        console.error("Error updating localStorage:", e);
      }
      
      return { 
        success: true, 
        data: insertData as UserType, 
        error: null,
        existing: false
      };
    }
  } catch (error) {
    console.error("Exception in createUserProfileIfNotExists:", error);
    
    // Create a minimal local profile for offline functionality
    const fallbackProfile = {
      id: userId,
      email: email,
      completed_challenges: 0,
      total_points: 0,
      streak: 0,
      profile_completed: false,
    };
    
    // Store the fallback profile in localStorage
    try {
      localStorage.setItem(`profile_${userId}`, JSON.stringify(fallbackProfile));
      console.log("Created fallback profile in localStorage after exception");
    } catch (e) {
      console.error("Error creating fallback profile in localStorage:", e);
    }
    
    return { 
      success: false, 
      error, 
      data: fallbackProfile as UserType,
      existing: false,
      fallback: true
    };
  }
};
