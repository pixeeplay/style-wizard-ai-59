-- Add try_on_image_url column to outfits table
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS try_on_image_url text;

-- Add visualization_style column to store which style was used
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS visualization_style text;

-- Create storage bucket for try-on images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tryon-images', 'tryon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload their own try-on images
CREATE POLICY "Users can upload their own try-on images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tryon-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Try-on images are publicly readable
CREATE POLICY "Try-on images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tryon-images');

-- Storage policy: Users can delete their own try-on images
CREATE POLICY "Users can delete their own try-on images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tryon-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);