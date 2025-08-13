-- Add lead_label column to contact_requests for labeling leads
ALTER TABLE public.contact_requests
ADD COLUMN IF NOT EXISTS lead_label text;

-- Optional: index for faster filtering by label
CREATE INDEX IF NOT EXISTS idx_contact_requests_lead_label
ON public.contact_requests(lead_label);