-- Create cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property types table
CREATE TABLE public.property_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert current cities
INSERT INTO public.cities (name, slug, display_order) VALUES
  ('Berlin', 'berlin', 1),
  ('Hamburg', 'hamburg', 2),
  ('München', 'muenchen', 3),
  ('Frankfurt', 'frankfurt', 4),
  ('Düsseldorf', 'duesseldorf', 5),
  ('Köln', 'koeln', 6),
  ('Stuttgart', 'stuttgart', 7);

-- Insert current property types
INSERT INTO public.property_types (name, slug, display_order) VALUES
  ('Wohnung', 'wohnung', 1),
  ('Haus', 'haus', 2),
  ('Studio', 'studio', 3),
  ('Maisonette', 'maisonette', 4),
  ('Penthouse', 'penthouse', 5);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_types_updated_at
  BEFORE UPDATE ON public.property_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();