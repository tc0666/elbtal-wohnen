-- Fix all image URLs with missing parameters and ensure consistency
UPDATE public.properties 
SET images = ARRAY[
  'https://images.unsplash.com/photo-1555636222-cae831e670b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1560449752-09b9e9b0c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
]
WHERE id = '51eb6b32-9b12-4257-b74e-29355beb64b8';

-- Also fix all other properties to ensure no broken image URLs
UPDATE public.properties 
SET images = ARRAY[
  -- Replace any URLs that don't have proper parameters
  CASE 
    WHEN images[1] LIKE '%?ixlib%' THEN images[1] 
    ELSE REGEXP_REPLACE(images[1], '\?.*$', '') || '?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  END,
  CASE 
    WHEN images[2] LIKE '%?ixlib%' THEN images[2] 
    ELSE REGEXP_REPLACE(images[2], '\?.*$', '') || '?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  END,
  CASE 
    WHEN images[3] LIKE '%?ixlib%' THEN images[3] 
    ELSE REGEXP_REPLACE(images[3], '\?.*$', '') || '?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  END,
  CASE 
    WHEN images[4] LIKE '%?ixlib%' THEN images[4] 
    ELSE REGEXP_REPLACE(images[4], '\?.*$', '') || '?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  END
]
WHERE array_length(images, 1) >= 4;