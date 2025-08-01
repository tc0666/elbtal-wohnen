-- Create properties table with all necessary fields
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in euros
  area_sqm INTEGER NOT NULL,
  rooms TEXT NOT NULL, -- e.g., "2", "3", "4+", "Studio"
  property_type_id UUID REFERENCES public.property_types(id),
  city_id UUID REFERENCES public.cities(id),
  address TEXT NOT NULL,
  postal_code TEXT,
  neighborhood TEXT,
  floor INTEGER,
  total_floors INTEGER,
  year_built INTEGER,
  balcony BOOLEAN DEFAULT false,
  elevator BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  pets_allowed BOOLEAN DEFAULT false,
  available_from DATE,
  deposit_months INTEGER DEFAULT 3,
  utilities_included BOOLEAN DEFAULT false,
  images TEXT[], -- array of image URLs
  features TEXT[], -- array of feature strings
  coordinates POINT, -- for map functionality
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policy for public reading
CREATE POLICY "Properties are publicly readable" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo properties
INSERT INTO public.properties (
  title, description, price_monthly, area_sqm, rooms, 
  property_type_id, city_id, address, postal_code, neighborhood,
  floor, total_floors, year_built, balcony, elevator, parking, 
  furnished, pets_allowed, available_from, deposit_months, 
  utilities_included, images, features, is_featured
) VALUES 
(
  'Modern Studio in Mitte',
  'Stylish studio apartment in the heart of Berlin with modern amenities and excellent transport connections.',
  850, 35, '1', 
  (SELECT id FROM public.property_types WHERE slug = 'studio' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'berlin' LIMIT 1),
  'Friedrichstraße 123', '10117', 'Mitte',
  3, 5, 2018, true, true, false,
  true, false, '2024-02-01', 3,
  true, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'], 
  ARRAY['High-speed WiFi', 'Dishwasher', 'Washer/Dryer', 'Air Conditioning'], true
),
(
  'Spacious 2-Bedroom in Prenzlauer Berg',
  'Beautiful 2-bedroom apartment with high ceilings and original features in trendy Prenzlauer Berg.',
  1450, 75, '2',
  (SELECT id FROM public.property_types WHERE slug = 'wohnung' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'berlin' LIMIT 1),
  'Kastanienallee 45', '10435', 'Prenzlauer Berg',
  2, 4, 1920, true, false, false,
  false, true, '2024-03-15', 3,
  false, ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
  ARRAY['Hardwood floors', 'High ceilings', 'Garden access', 'Pet-friendly'], false
),
(
  'Luxury Penthouse in Charlottenburg',
  'Exclusive penthouse with panoramic city views and premium finishes in prestigious Charlottenburg.',
  3200, 120, '3',
  (SELECT id FROM public.property_types WHERE slug = 'penthouse' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'berlin' LIMIT 1),
  'Kurfürstendamm 200', '10719', 'Charlottenburg',
  8, 8, 2020, true, true, true,
  true, false, '2024-02-15', 3,
  true, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
  ARRAY['Roof terrace', 'Floor heating', 'Smart home', 'Concierge'], true
),
(
  'Cozy 1-Bedroom in Kreuzberg',
  'Charming 1-bedroom apartment in vibrant Kreuzberg with authentic Berlin character.',
  980, 45, '1',
  (SELECT id FROM public.property_types WHERE slug = 'wohnung' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'berlin' LIMIT 1),
  'Bergmannstraße 67', '10961', 'Kreuzberg',
  1, 3, 1960, false, false, false,
  false, true, '2024-04-01', 2,
  false, ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858'],
  ARRAY['Original features', 'Courtyard', 'Near U-Bahn', 'Pet-friendly'], false
),
(
  'Modern Family House in Hamburg',
  'Spacious family house with garden in quiet residential area of Hamburg.',
  2100, 140, '4',
  (SELECT id FROM public.property_types WHERE slug = 'haus' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'hamburg' LIMIT 1),
  'Elbchaussee 89', '22763', 'Altona',
  0, 2, 2015, false, false, true,
  false, true, '2024-03-01', 3,
  false, ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be'],
  ARRAY['Private garden', 'Garage', 'Modern kitchen', 'Family-friendly'], true
),
(
  'Executive Studio in München',
  'Premium studio apartment in München city center, perfect for business travelers.',
  1250, 40, '1',
  (SELECT id FROM public.property_types WHERE slug = 'studio' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'muenchen' LIMIT 1),
  'Maximilianstraße 15', '80539', 'Altstadt',
  4, 6, 2019, true, true, false,
  true, false, '2024-02-20', 3,
  true, ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb'],
  ARRAY['City center', 'Business district', 'Concierge', 'Gym access'], false
),
(
  'Elegant 3-Bedroom in Frankfurt',
  'Sophisticated 3-bedroom apartment in Frankfurt financial district with modern amenities.',
  1850, 95, '3',
  (SELECT id FROM public.property_types WHERE slug = 'wohnung' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'frankfurt' LIMIT 1),
  'Taunusanlage 12', '60325', 'Westend',
  6, 10, 2017, true, true, true,
  false, false, '2024-03-10', 3,
  false, ARRAY['https://images.unsplash.com/photo-1555636222-cae831e670b3'],
  ARRAY['Financial district', 'Modern appliances', 'Parking space', 'Near public transport'], true
),
(
  'Artistic Loft in Düsseldorf',
  'Unique loft apartment in converted warehouse with industrial charm in Düsseldorf.',
  1350, 80, '2',
  (SELECT id FROM public.property_types WHERE slug = 'wohnung' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'duesseldorf' LIMIT 1),
  'Birkenstraße 23', '40233', 'Flingern',
  2, 3, 1995, false, false, false,
  false, true, '2024-04-15', 2,
  false, ARRAY['https://images.unsplash.com/photo-1524758631624-e2822e304c36'],
  ARRAY['High ceilings', 'Industrial style', 'Art district', 'Creative space'], false
),
(
  'Student-Friendly Apartment in Köln',
  'Affordable 2-bedroom apartment perfect for students or young professionals in Köln.',
  750, 55, '2',
  (SELECT id FROM public.property_types WHERE slug = 'wohnung' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'koeln' LIMIT 1),
  'Zülpicher Straße 145', '50937', 'Sülz',
  1, 4, 1975, true, false, false,
  false, true, '2024-02-28', 2,
  false, ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000'],
  ARRAY['Student area', 'Near university', 'Public transport', 'Affordable'], false
),
(
  'Luxury Maisonette in Stuttgart',
  'Exclusive maisonette apartment with two levels and premium finishes in Stuttgart.',
  2400, 110, '4',
  (SELECT id FROM public.property_types WHERE slug = 'maisonette' LIMIT 1),
  (SELECT id FROM public.cities WHERE slug = 'stuttgart' LIMIT 1),
  'Königstraße 78', '70173', 'Mitte',
  5, 7, 2021, true, true, true,
  true, false, '2024-03-20', 3,
  true, ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
  ARRAY['Two levels', 'Premium finishes', 'City center', 'Luxury amenities'], true
);