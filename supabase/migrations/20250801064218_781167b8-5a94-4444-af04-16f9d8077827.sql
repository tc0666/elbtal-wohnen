-- Add is_active column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;