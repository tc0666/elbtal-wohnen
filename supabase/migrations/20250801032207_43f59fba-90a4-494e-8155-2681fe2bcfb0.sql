-- First, let's get the existing city and property type IDs we can use
-- Add 5 more properties for testing pagination

-- Get Berlin city ID and property type IDs (we'll use UUIDs that should exist)
DO $$
DECLARE
    berlin_id UUID;
    wohnung_id UUID;
    haus_id UUID;
    studio_id UUID;
BEGIN
    -- Get Berlin city ID
    SELECT id INTO berlin_id FROM cities WHERE slug = 'berlin' LIMIT 1;
    
    -- Get property type IDs
    SELECT id INTO wohnung_id FROM property_types WHERE slug = 'wohnung' LIMIT 1;
    SELECT id INTO haus_id FROM property_types WHERE slug = 'haus' LIMIT 1;
    SELECT id INTO studio_id FROM property_types WHERE slug = 'studio' LIMIT 1;

    -- Insert 5 new properties
    INSERT INTO properties (
        title, description, price_monthly, area_sqm, rooms, address, neighborhood, 
        city_id, property_type_id, floor, balcony, elevator, parking, pets_allowed, 
        furnished, available_from, images, features, is_featured, is_active
    ) VALUES 
    (
        'Moderne 3-Zimmer Wohnung in Mitte',
        'Schöne renovierte Wohnung mit hohen Decken und großen Fenstern. Zentrale Lage mit guter Verkehrsanbindung.',
        1850, 85, '3', 'Friedrichstraße 45', 'Mitte',
        berlin_id, wohnung_id, 3, true, true, false, false, false,
        '2024-03-01', 
        ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
        ARRAY['Zentrale Lage', 'Renoviert', 'Hohe Decken'],
        false, true
    ),
    (
        'Gemütliches Studio Apartment',
        'Kompaktes aber funktionales Studio in beliebter Wohngegend. Perfekt für Singles oder Studenten.',
        950, 32, '1', 'Kastanienallee 12', 'Prenzlauer Berg',
        berlin_id, studio_id, 2, false, false, false, true, true,
        '2024-02-15',
        ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'],
        ARRAY['Möbliert', 'Zentral gelegen', 'Haustiere erlaubt'],
        false, true
    ),
    (
        'Luxuriöse 4-Zimmer Wohnung',
        'Exklusive Wohnung mit Balkon und Parkplatz. High-End Ausstattung und moderne Technik.',
        2800, 120, '4', 'Unter den Linden 88', 'Mitte',
        berlin_id, wohnung_id, 5, true, true, true, false, false,
        '2024-04-01',
        ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'],
        ARRAY['Luxuriös', 'Parkplatz', 'Moderne Ausstattung'],
        true, true
    ),
    (
        'Charmante 2-Zimmer Altbauwohnung',
        'Charaktervolle Altbauwohnung mit original Stuckelementen und Dielenboden.',
        1450, 68, '2', 'Bergmannstraße 34', 'Kreuzberg',
        berlin_id, wohnung_id, 1, false, false, false, false, false,
        '2024-03-15',
        ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'],
        ARRAY['Altbau', 'Stuckelemente', 'Dielenboden'],
        false, true
    ),
    (
        'Großes Stadthaus mit Garten',
        'Familienfreundliches Haus mit eigenem Garten und Garage. Ruhige Lage am Stadtrand.',
        3200, 180, '5+', 'Gartenweg 15', 'Zehlendorf',
        berlin_id, haus_id, 0, false, false, true, true, false,
        '2024-05-01',
        ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
        ARRAY['Garten', 'Familienfreundlich', 'Garage'],
        true, true
    );
END $$;