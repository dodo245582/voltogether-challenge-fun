
-- First, remove the password unique constraint that's causing issues
ALTER TABLE public."Users" DROP CONSTRAINT IF EXISTS "Users_password_key";

-- Make password nullable since we're using Supabase Auth
ALTER TABLE public."Users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE public."Users" ALTER COLUMN "password" SET DEFAULT NULL;
