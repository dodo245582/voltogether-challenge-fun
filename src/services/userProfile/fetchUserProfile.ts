
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Fetches a user profile by user ID
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    // Add console logs to track execution
    console.log("Service: Fetching user profile for ID:", userId);
    
    // First try to get from localStorage as an optimization
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        console.log("Service: Found cached profile, using it for initial render");
        // Still fetch from DB but use cache immediately
        const profileData = JSON.parse(cachedProfile) as UserType;
        
        // Start DB fetch in the background
        supabase
          .from('Users')
          .select('*')
          .eq('id', userId)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              // Only update localStorage if there's new data
              localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
            }
          });
        
        return { data: profileData, error: null };
      }
    } catch (e) {
      console.error("Error retrieving profile from localStorage:", e);
      // Continue with database fetch if localStorage fails
    }
    
    // Fetch from database if not in localStorage
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
      console.log("Service: User profile fetched successfully");
      
      // Ensure data has proper structure - using explicit type assertions to handle potential nulls
      const sanitizedData = {
        ...data,
        // Ensure non-null values by defaulting to empty strings
        name: data.name || '',
        city: data.city || '',
        completed_challenges: data.completed_challenges || 0,
        total_points: data.total_points || 0,
        streak: data.streak || 0,
        discovery_source: data.discovery_source || '',
        selected_actions: data.selected_actions || []
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
      return { data: null, error: new Error("No user profile found") };
    }
  } catch (error) {
    console.error("Service: Exception in fetchUserProfile:", error);
    return { data: null, error };
  }
};
