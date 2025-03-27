
-- Crea una funzione che consente di creare un profilo utente senza rispettare le policy RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id UUID, user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Controlla se il profilo esiste già
  IF EXISTS (SELECT 1 FROM public."Users" WHERE id = user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Inserisci il nuovo profilo
  INSERT INTO public."Users" (
    id, 
    email, 
    name, 
    total_points, 
    completed_challenges, 
    streak
  ) VALUES (
    user_id,
    user_email,
    '',
    0,
    0,
    0
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN FALSE;
END;
$$;
