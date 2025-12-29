-- Create enum for clothing categories
CREATE TYPE public.clothing_category AS ENUM (
  'top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'underwear', 'swimwear', 'sportswear'
);

-- Create enum for clothing status
CREATE TYPE public.clothing_status AS ENUM ('available', 'laundry');

-- Create enum for seasons
CREATE TYPE public.season AS ENUM ('spring', 'summer', 'fall', 'winter', 'all');

-- Create enum for style types
CREATE TYPE public.style_type AS ENUM ('casual', 'formal', 'sport', 'business', 'evening', 'vacation');

-- Create enum for body morphology
CREATE TYPE public.body_morphology AS ENUM ('rectangle', 'hourglass', 'inverted_triangle', 'triangle', 'oval', 'athletic');

-- Create profiles table for user data and measurements
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  height_cm INTEGER,
  weight_kg INTEGER,
  morphology body_morphology,
  style_preferences style_type[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wardrobe table for clothing items
CREATE TABLE public.wardrobe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  name TEXT,
  category clothing_category NOT NULL,
  color TEXT NOT NULL,
  secondary_color TEXT,
  season season DEFAULT 'all',
  style style_type DEFAULT 'casual',
  brand TEXT,
  status clothing_status DEFAULT 'available',
  notes TEXT,
  wear_count INTEGER DEFAULT 0,
  last_worn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outfits table for generated looks
CREATE TABLE public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  items UUID[] NOT NULL,
  occasion TEXT,
  season season,
  is_favorite BOOLEAN DEFAULT FALSE,
  wear_count INTEGER DEFAULT 0,
  last_worn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packing_lists table for travel mode
CREATE TABLE public.packing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trip_type style_type DEFAULT 'vacation',
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_lists ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Wardrobe policies
CREATE POLICY "Users can view their own wardrobe"
  ON public.wardrobe FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clothes"
  ON public.wardrobe FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothes"
  ON public.wardrobe FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothes"
  ON public.wardrobe FOR DELETE
  USING (auth.uid() = user_id);

-- Outfits policies
CREATE POLICY "Users can view their own outfits"
  ON public.outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits"
  ON public.outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits"
  ON public.outfits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits"
  ON public.outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Packing lists policies
CREATE POLICY "Users can view their own packing lists"
  ON public.packing_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packing lists"
  ON public.packing_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packing lists"
  ON public.packing_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packing lists"
  ON public.packing_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_wardrobe_updated
  BEFORE UPDATE ON public.wardrobe
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-images', 'wardrobe-images', true);

-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies for wardrobe images
CREATE POLICY "Users can view all wardrobe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wardrobe-images');

CREATE POLICY "Users can upload their own wardrobe images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own wardrobe images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own wardrobe images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);