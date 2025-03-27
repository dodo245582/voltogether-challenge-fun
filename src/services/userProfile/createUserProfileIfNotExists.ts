
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a user profile if it doesn't already exist
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!userId || !email) {
    console.error("Cannot create profile - missing user ID or email");
    return { 
      error: new Error('User ID and email are required'), 
      success: false 
    };
  }

  try {
    console.log("Service: Checking if user profile exists for:", userId);
    
    // Add cache validation to avoid repeated checks
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        // If we have a complete cached profile with ID matching the user, return it
        if (profile && profile.id === userId) {
          console.log("Service: Using cached profile, no need to check database");
          return { error: null, success: true, data: profile };
        }
      }
    } catch (e) {
      console.error("Error retrieving profile from localStorage:", e);
    }
    
    // First check if profile exists
    const { data: existingProfile, error: lookupError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (lookupError && lookupError.code !== 'PGRST116') {
      // Real error (not just "not found")
      console.error("Service: Error checking for existing profile:", lookupError);
      return { error: lookupError, success: false };
    }
    
    // If profile already exists, return success
    if (existingProfile) {
      console.log("Service: Profile already exists, no need to create");
      
      // Update cache with the fresh data
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(existingProfile));
      } catch (e) {
        console.error("Error storing profile in localStorage:", e);
      }
      
      return { error: null, success: true, data: existingProfile };
    }
    
    // Create profile if it doesn't exist
    console.log("Service: Creating new user profile for:", userId);
    console.log("Service: Using email:", email);
    
    // Add a retry mechanism with exponential backoff
    let retryCount = 0;
    const maxRetries = 3;
    let lastError = null;
    
    while (retryCount < maxRetries) {
      try {
        // Use separate insert to avoid unique constraint violations
        const { error: insertError, data: newProfile } = await supabase
          .from('Users')
          .insert({
            id: userId,
            email: email,
            name: '',
            profile_completed: false
          })
          .select();
        
        if (!insertError) {
          console.log("Service: Profile created successfully:", newProfile);
          
          // Also store in localStorage for immediate access
          try {
            localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile?.[0] || {
              id: userId,
              email: email,
              total_points: 0,
              completed_challenges: 0,
              streak: 0
            }));
          } catch (e) {
            console.error("Error storing profile in localStorage:", e);
          }
          
          return { error: null, success: true, data: newProfile?.[0] || null };
        }
        
        // If we got an error but it's a duplicate key error, try to fetch instead
        if (insertError && insertError.code === '23505') {
          console.log("Duplicate key error, likely race condition. Fetching profile instead.");
          
          // Try to fetch the profile that was likely created by another concurrent request
          const { data: existingProfile, error: fetchError } = await supabase
            .from('Users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (!fetchError && existingProfile) {
            console.log("Successfully fetched profile that was created concurrently");
            
            try {
              localStorage.setItem(`profile_${userId}`, JSON.stringify(existingProfile));
            } catch (e) {
              console.error("Error storing profile in localStorage:", e);
            }
            
            return { error: null, success: true, data: existingProfile };
          }
          
          // If we still can't fetch, fall through to retry or use the edge function
          lastError = fetchError || insertError;
        } else {
          lastError = insertError;
        }
      } catch (error) {
        console.error("Service: Error in createUserProfileIfNotExists retry attempt:", error);
        lastError = error;
      }
      
      // Increment retry count and delay with exponential backoff
      retryCount++;
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 100; // 200, 400, 800ms...
        console.log(`Retrying profile creation in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we've exhausted retries, try the edge function as a fallback
    console.log("Regular profile creation failed after retries. Attempting edge function...");
    
    try {
      const { data: directInsertData, error: directInsertError } = await supabase.functions.invoke(
        'create-user-profile-function',
        {
          body: {
            userId: userId,
            email: email
          }
        }
      );
        
      if (directInsertError) {
        console.error("Direct insert failed:", directInsertError);
        return { error: directInsertError || lastError, success: false };
      }
      
      console.log("Direct insert succeeded:", directInsertData);
      
      // Get the newly created profile
      const { data: createdProfile } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (createdProfile) {
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(createdProfile));
        } catch (e) {
          console.error("Error storing profile in localStorage:", e);
        }
        
        return { error: null, success: true, data: createdProfile };
      }
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
    }
    
    // If both approaches failed, we return an error
    return { error: lastError, success: false };
  } catch (error) {
    console.error("Service: Exception in createUserProfileIfNotExists:", error);
    return { error, success: false };
  }
};
