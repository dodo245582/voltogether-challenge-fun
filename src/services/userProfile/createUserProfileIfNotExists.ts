
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
      console.log("Existing profile data:", existingProfile);
      return { error: null, success: true, data: existingProfile };
    }
    
    // Create profile if it doesn't exist
    console.log("Service: Creating new user profile for:", userId);
    console.log("Service: Using email:", email);
    
    // Log current auth status
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current auth session:", session ? "Exists" : "None");
    
    const { error: insertError, data: newProfile } = await supabase
      .from('Users')
      .insert({
        id: userId,
        email: email,
        name: '',
        total_points: 0,
        completed_challenges: 0,
        streak: 0
      })
      .select();
    
    if (insertError) {
      console.error("Service: Error creating profile:", insertError);
      
      // Se l'errore è di violazione RLS, potrebbe essere perché l'utente non è autenticato correttamente
      if (insertError.code === '42501') {
        console.error("RLS policy violation - make sure user is authenticated");
      }
      
      // Fallback: try creating without RLS (if the policy is causing issues)
      console.log("Attempting direct insert via function...");
      try {
        const { data: directInsertData, error: directInsertError } = await supabase
          .rpc('create_user_profile', {
            user_id: userId,
            user_email: email
          });
          
        if (directInsertError) {
          console.error("Direct insert failed:", directInsertError);
          return { error: directInsertError, success: false };
        }
        
        console.log("Direct insert succeeded:", directInsertData);
        
        // Get the newly created profile
        const { data: createdProfile } = await supabase
          .from('Users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (createdProfile) {
          // Also store in localStorage
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
      
      return { error: insertError, success: false };
    }
    
    console.log("Service: Profile created successfully:", newProfile);
    
    // Also store in localStorage
    try {
      localStorage.setItem(`profile_${userId}`, JSON.stringify({
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
  } catch (error) {
    console.error("Service: Exception in createUserProfileIfNotExists:", error);
    return { error, success: false };
  }
};
