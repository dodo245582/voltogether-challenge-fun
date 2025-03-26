
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a user profile if it doesn't exist
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!email) return { success: false, error: new Error("Email is required") };
  
  try {
    console.log("Service: Checking if user profile exists for ID:", userId);
    
    const { data, error } = await supabase
      .from('Users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Service: Error checking user profile:', error);
      return { success: false, error };
    }
    
    if (!data) {
      console.log("Service: Creating new user profile for:", email);
      const { error: insertError } = await supabase
        .from('Users')
        .insert({
          id: userId,
          email: email,
          completed_challenges: 0,
          total_points: 0,
          streak: 0
        });
      
      if (insertError) {
        console.error('Service: Error creating user profile:', insertError);
        
        // Create a local profile in localStorage as a fallback
        try {
          const initialProfile = {
            id: userId,
            email: email,
            completed_challenges: 0,
            total_points: 0,
            streak: 0
          };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(initialProfile));
          console.log("Service: Created profile in localStorage as fallback");
        } catch (e) {
          console.error("Error storing profile in localStorage:", e);
        }
        
        return { success: false, error: insertError };
      } else {
        console.log("Service: User profile created successfully");
        return { success: true, error: null };
      }
    } else {
      console.log("Service: User profile already exists");
      return { success: true, error: null };
    }
  } catch (error) {
    console.error("Service: Exception in createUserProfileIfNotExists:", error);
    return { success: false, error };
  }
};
