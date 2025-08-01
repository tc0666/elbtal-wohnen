-- Fix the broken image URL that's causing 404 errors
UPDATE properties 
SET images = array_replace(
  images, 
  'https://images.unsplash.com/photo-1560449752-09b9e9b0c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
)
WHERE 'https://images.unsplash.com/photo-1560449752-09b9e9b0c12a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' = ANY(images);