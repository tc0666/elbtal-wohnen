-- Create storage buckets for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('featured-images', 'featured-images', true);

-- Create storage policies for property images
CREATE POLICY "Property images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Admin can upload property images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Admin can update property images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'property-images');

CREATE POLICY "Admin can delete property images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'property-images');

-- Create storage policies for featured images
CREATE POLICY "Featured images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'featured-images');

CREATE POLICY "Admin can upload featured images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'featured-images');

CREATE POLICY "Admin can update featured images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'featured-images');

CREATE POLICY "Admin can delete featured images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'featured-images');