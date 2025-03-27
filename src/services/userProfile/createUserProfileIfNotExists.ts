
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Creates a user profile if it doesn't exist
 */
export const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
  if (!userId || !email) {
    return { 
      success: false, 
      error: new Error('User ID and email are required'),
      data: null
    };
  }

  try {
    console.log("Service: Attempting to create/verify profile for user:", userId);
    
    // Prima, verifica se il profilo esiste già nel database
    const { data: existingProfile, error: checkError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log("Service: Profile already exists in database");
      return { 
        success: true, 
        error: null,
        data: existingProfile as UserType,
        existing: true
      };
    }
    
    // Se il profilo non esiste, chiamiamo la edge function per crearlo
    // Questo bypasserà RLS e creerà il profilo con il ruolo di servizio
    console.log("Service: Profile not found in database, calling edge function");
    
    // Imposta un timeout per la chiamata alla edge function
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Edge function timeout')), 10000);
    });
    
    // Chiamata alla edge function con retry
    const callEdgeFunction = async (retryCount = 0): Promise<any> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-profile-function`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`
          },
          body: JSON.stringify({ userId, email })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Edge function failed: ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (retryCount < 2) { // Riprova fino a 2 volte
          console.log(`Service: Retrying edge function call (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Attendi 1 secondo prima di riprovare
          return callEdgeFunction(retryCount + 1);
        }
        throw error;
      }
    };
    
    // Esegui la chiamata alla edge function con un timeout
    const result = await Promise.race([callEdgeFunction(), timeoutPromise]) as any;
    
    console.log("Service: Edge function result:", result);
    
    if (result.success) {
      // Aggiorna la cache localStorage
      try {
        if (result.data) {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(result.data));
        }
      } catch (e) {
        console.error("Error updating localStorage:", e);
      }
      
      // Rifetch dal database per sicurezza
      const { data: verifiedProfile } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (verifiedProfile) {
        console.log("Service: Profile verified in database after creation");
        return { 
          success: true, 
          error: null,
          data: verifiedProfile as UserType,
          existing: result.existing
        };
      }
      
      return { 
        success: true, 
        error: null,
        data: result.data as UserType,
        existing: result.existing
      };
    } else {
      throw new Error(result.message || 'Failed to create profile');
    }
  } catch (error) {
    console.error("Service: Error in createUserProfileIfNotExists:", error);
    
    // Fallback alla creazione diretta tramite client se l'edge function fallisce
    try {
      console.log("Service: Attempting fallback direct creation");
      
      // Prima controlla di nuovo se il profilo esiste
      const { data: doubleCheckProfile } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (doubleCheckProfile) {
        console.log("Service: Profile found in second check");
        return { 
          success: true, 
          error: null,
          data: doubleCheckProfile as UserType,
          existing: true
        };
      }
      
      // Tenta la creazione diretta (potrebbe fallire con RLS)
      const { data, error: insertError } = await supabase
        .from('Users')
        .insert([{
          id: userId,
          email: email,
          completed_challenges: 0,
          total_points: 0,
          streak: 0,
          profile_completed: false
        }])
        .select();
      
      if (insertError) {
        console.error("Service: Direct creation fallback failed:", insertError);
        return { 
          success: false, 
          error: insertError,
          data: null
        };
      }
      
      if (data && data.length > 0) {
        console.log("Service: Profile created via direct fallback");
        return { 
          success: true, 
          error: null,
          data: data[0] as UserType,
          existing: false
        };
      } else {
        return { 
          success: false, 
          error: new Error('No data returned from profile creation'),
          data: null
        };
      }
    } catch (fallbackError) {
      console.error("Service: Fallback creation failed:", fallbackError);
      return { 
        success: false, 
        error: new Error(`Failed to create profile: ${error.message}, fallback also failed: ${fallbackError.message}`),
        data: null
      };
    }
  }
};
