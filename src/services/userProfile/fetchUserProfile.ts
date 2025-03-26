
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Fetches a user profile by user ID
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    // Add console logs to track execution
    console.log("Service: Fetching user profile for ID:", userId);
    
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Service: Error fetching user profile:', error);
      return { data: null, error };
    }
    
    if (data) {
      console.log("Service: User profile fetched successfully", data);
      
      // Ensure data has proper structure (fix undefined values)
      const sanitizedData = {
        ...data,
        // Convert any undefined or object-wrapped values to proper strings
        name: typeof data.name === 'object' ? 
              (data.name?.value !== 'undefined' ? data.name?.value : '') : 
              (data.name || ''),
        city: typeof data.city === 'object' ? 
              (data.city?.value !== 'undefined' ? data.city?.value : '') : 
              (data.city || '')
      };
      
      // Store the sanitized profile in localStorage as a fallback mechanism
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(sanitizedData));
      } catch (e) {
        console.error("Error storing profile in localStorage:", e);
      }
      
      return { data: sanitizedData as UserType, error: null };
    } else {
      console.log("Service: No user profile found");
      
      // Try to get profile from localStorage if database fetch failed
      try {
        const cachedProfile = localStorage.getItem(`profile_${userId}`);
        if (cachedProfile) {
          console.log("Service: Retrieved profile from localStorage");
          return { data: JSON.parse(cachedProfile) as UserType, error: null };
        }
      } catch (e) {
        console.error("Error retrieving profile from localStorage:", e);
      }
      
      return { data: null, error: new Error("No user profile found") };
    }
  } catch (error) {
    console.error("Service: Exception in fetchUserProfile:", error);
    return { data: null, error };
  }
};
