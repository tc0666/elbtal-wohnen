-- Fix RLS security issues by enabling public access to cities and property types
-- Since these are reference data that should be publicly accessible

-- Enable RLS on cities table
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on property_types table  
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to cities
CREATE POLICY "Cities are publicly readable" 
ON public.cities 
FOR SELECT 
USING (true);

-- Create policies for public read access to property types
CREATE POLICY "Property types are publicly readable" 
ON public.property_types 
FOR SELECT 
USING (true);

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';