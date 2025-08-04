-- Fix existing properties where address contains both postal code and city name
-- Update address to only contain postal code for properties imported from XLSX
UPDATE properties 
SET address = postal_code 
WHERE description LIKE '%Imported from XLSX%' 
  AND address != postal_code
  AND postal_code IS NOT NULL 
  AND postal_code != '';

-- Also fix any addresses that look like "12345 CityName" pattern
UPDATE properties 
SET address = postal_code 
WHERE address ~ '^[0-9]{5}\s+[A-Za-z]+' 
  AND postal_code IS NOT NULL 
  AND postal_code != '';