-- Fix function search path security warning
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also fix the get_contact_requests_secure function search path
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
    SELECT 1 FROM public.admin_sessions 
    WHERE token = admin_token 
    AND is_active = true 
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;

  -- Log admin access
  INSERT INTO public.audit_log (table_name, operation, details)
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
  FROM public.contact_requests cr
  ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql;