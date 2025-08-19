-- Add lead_stage column to contact_requests table
ALTER TABLE public.contact_requests 
ADD COLUMN lead_stage text;

-- Create an index on lead_stage for better performance
CREATE INDEX idx_contact_requests_lead_stage ON public.contact_requests(lead_stage);

-- Drop the existing function to allow return type change
DROP FUNCTION IF EXISTS public.get_contact_requests_secure(text);

-- Recreate the function with the new return type including lead_stage
CREATE OR REPLACE FUNCTION public.get_contact_requests_secure(admin_token text)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, property_id uuid, anrede text, vorname text, nachname text, email text, telefon text, status text, nachricht text, lead_label text, lead_stage text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    cr.lead_label,
    cr.lead_stage
  FROM public.contact_requests cr
  ORDER BY cr.created_at DESC;
END;
$function$;