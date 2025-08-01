-- Add missing columns for detailed property information
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS energy_certificate_type TEXT,
ADD COLUMN IF NOT EXISTS energy_certificate_value TEXT,
ADD COLUMN IF NOT EXISTS heating_type TEXT,
ADD COLUMN IF NOT EXISTS heating_energy_source TEXT,
ADD COLUMN IF NOT EXISTS additional_costs_monthly INTEGER,
ADD COLUMN IF NOT EXISTS internet_speed TEXT,
ADD COLUMN IF NOT EXISTS kitchen_equipped BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dishwasher BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS washing_machine BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dryer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tv BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS garden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cellar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attic BOOLEAN DEFAULT false;

-- Update existing properties with additional images and detailed information
UPDATE public.properties 
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560449752-09b9e9b0c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560449752-09b9e9b0c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  energy_certificate_type = 'Energieausweis',
  energy_certificate_value = 'B (85 kWh/(m²a))',
  heating_type = 'Zentralheizung',
  heating_energy_source = 'Gas',
  additional_costs_monthly = 280,
  internet_speed = '100 Mbit/s',
  kitchen_equipped = true,
  dishwasher = true,
  washing_machine = false,
  dryer = false,
  tv = false,
  garden = false,
  cellar = true,
  attic = false
WHERE title = 'Moderne 3-Zimmer-Wohnung in München-Schwabing';

UPDATE public.properties 
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  energy_certificate_type = 'Energieausweis',
  energy_certificate_value = 'A (45 kWh/(m²a))',
  heating_type = 'Fußbodenheizung',
  heating_energy_source = 'Fernwärme',
  additional_costs_monthly = 180,
  internet_speed = '250 Mbit/s',
  kitchen_equipped = true,
  dishwasher = true,
  washing_machine = true,
  dryer = true,
  tv = true,
  garden = true,
  cellar = false,
  attic = true
WHERE title = 'Stilvolle Altbauwohnung in Berlin-Prenzlauer Berg';

UPDATE public.properties 
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560449752-09b9e9b0c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  energy_certificate_type = 'Energieausweis',
  energy_certificate_value = 'C (95 kWh/(m²a))',
  heating_type = 'Zentralheizung',
  heating_energy_source = 'Öl',
  additional_costs_monthly = 320,
  internet_speed = '50 Mbit/s',
  kitchen_equipped = false,
  dishwasher = false,
  washing_machine = false,
  dryer = false,
  tv = false,
  garden = false,
  cellar = true,
  attic = false
WHERE title = 'Gemütliche 2-Zimmer-Wohnung in Hamburg-Eimsbüttel';