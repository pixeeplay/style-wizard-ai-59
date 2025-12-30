-- Add purchase_price column to wardrobe table
ALTER TABLE public.wardrobe ADD COLUMN purchase_price numeric(10,2) DEFAULT NULL;