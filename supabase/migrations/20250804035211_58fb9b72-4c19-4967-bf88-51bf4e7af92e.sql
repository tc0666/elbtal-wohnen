-- Remove cities with empty names or slugs
DELETE FROM cities WHERE name = '' OR slug = '' OR name IS NULL OR slug IS NULL;