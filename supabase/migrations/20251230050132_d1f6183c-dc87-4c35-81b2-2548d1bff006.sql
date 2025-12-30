-- Add columns for storing all 3 generated style images and scheduling
ALTER TABLE public.outfits 
ADD COLUMN IF NOT EXISTS try_on_images jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS scheduled_date date DEFAULT NULL;

-- Add index for calendar queries by date
CREATE INDEX IF NOT EXISTS idx_outfits_scheduled_date ON public.outfits(scheduled_date) WHERE scheduled_date IS NOT NULL;