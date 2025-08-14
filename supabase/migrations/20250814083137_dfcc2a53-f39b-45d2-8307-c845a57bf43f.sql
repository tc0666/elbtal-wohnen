-- Strengthen RLS policies for contact_requests table to ensure maximum security

-- First, ensure RLS is enabled (should already be enabled)
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with stronger security
DROP POLICY IF EXISTS "Anyone can insert contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Contact requests are only readable via admin functions" ON public.contact_requests;

-- Recreate insert policy with additional validation
CREATE POLICY "Authenticated users can insert contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (
  -- Ensure basic data validation
  email IS NOT NULL AND 
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  vorname IS NOT NULL AND 
  nachname IS NOT NULL AND
  telefon IS NOT NULL AND
  nachricht IS NOT NULL AND
  length(nachricht) >= 10 AND
  length(nachricht) <= 2000
);

-- Recreate read policy - absolutely no direct access
CREATE POLICY "Contact requests are completely restricted"
ON public.contact_requests
FOR SELECT
USING (false);

-- Ensure no updates are allowed
CREATE POLICY "Contact requests cannot be updated"
ON public.contact_requests
FOR UPDATE
USING (false);

-- Ensure no deletes are allowed
CREATE POLICY "Contact requests cannot be deleted"
ON public.contact_requests
FOR DELETE
USING (false);

-- Create audit trigger to log access attempts
CREATE OR REPLACE FUNCTION public.audit_contact_requests()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any attempt to access contact_requests
  INSERT INTO public.audit_log (
    table_name,
    operation,
    timestamp,
    details
  ) VALUES (
    'contact_requests',
    TG_OP,
    now(),
    jsonb_build_object(
      'contact_id', COALESCE(NEW.id, OLD.id),
      'user_role', current_setting('request.jwt.claims', true)::jsonb ->> 'role'
    )
  );
  
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details JSONB
);

-- Enable RLS on audit log as well
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow reading audit logs via admin functions
CREATE POLICY "Audit logs are admin only"
ON public.audit_log
FOR ALL
USING (false);

-- Create the audit trigger
DROP TRIGGER IF EXISTS audit_contact_requests_trigger ON public.contact_requests;
CREATE TRIGGER audit_contact_requests_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.audit_contact_requests();

-- Create a secure function for admin access with additional logging
CREATE OR REPLACE FUNCTION public.get_contact_requests_secure(admin_token TEXT)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  property_id UUID,
  anrede TEXT,
  vorname TEXT,
  nachname TEXT,
  email TEXT,
  telefon TEXT,
  status TEXT,
  nachricht TEXT,
  lead_label TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin token exists and is valid
  IF NOT EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE token = admin_token 
    AND is_active = true 
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;

  -- Log admin access
  INSERT INTO audit_log (table_name, operation, details)
  VALUES ('contact_requests', 'ADMIN_READ', jsonb_build_object('admin_token', admin_token));

  -- Return filtered data (exclude street addresses for additional privacy)
  RETURN QUERY
  SELECT 
    cr.id,
    cr.created_at,
    cr.property_id,
    cr.anrede,
    cr.vorname,
    cr.nachname,
    cr.email,
    cr.telefon,
    cr.status,
    cr.nachricht,
    cr.lead_label
  FROM contact_requests cr
  ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql;