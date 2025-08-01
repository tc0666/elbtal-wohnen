-- Add description fields for features and additional description
ALTER TABLE properties 
ADD COLUMN features_description TEXT,
ADD COLUMN additional_description TEXT;