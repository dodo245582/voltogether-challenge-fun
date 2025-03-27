
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Fetches a user profile by user ID
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log("Service: Fetching user profile for ID:", userId);
    
    // First try to get from localStorage
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        console.log("Service: Found cached profile, using it");
        const profileData = JSON.parse(cachedProfile) as UserType;
        
        // Start DB fetch in the background without awaiting it
        setTimeout(() => {
          supabase
            .from('Users')
            .select('*')
            .eq('id', userId)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
              }
            });
        }, 0);
        
        return { data: profileData, error: null };
      }
    } catch (e) {
      console.error("Error retrieving profile from localStorage:", e);
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
      
      // Ensure data has proper structure
      const sanitizedData = {
        ...data,
        name: data.name || '',
        city: data.city || '',
        completed_challenges: data.completed_challenges || 0,
        total_points: data.total_points || 0,
        streak: data.streak || 0,
        discovery_source: data.discovery_source || '',
        selected_actions: data.selected_actions || []
      };
      
      // Store in localStorage for faster future access
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
