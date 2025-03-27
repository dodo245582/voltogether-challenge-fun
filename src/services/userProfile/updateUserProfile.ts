
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  console.log("Tentativo aggiornamento profilo per userId:", userId, "con dati:", data);

  const { error } = await supabase
    .from('Users')
    .update(data)
    .eq('id', userId);

  if (error) {
    console.error("Errore nell'aggiornamento profilo Supabase:", error);
    return { success: false, error };
  }

  console.log("Profilo aggiornato correttamente su Supabase");
  return { success: true, error: null };
};
