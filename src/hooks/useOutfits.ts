import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TryOnImages {
  flatlay: string | null;
  mannequin: string | null;
  editorial: string | null;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string | null;
  items: string[];
  occasion: string | null;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all' | null;
  is_favorite: boolean;
  wear_count: number;
  last_worn_at: string | null;
  try_on_image_url: string | null;
  try_on_images: TryOnImages | null;
  scheduled_date: string | null;
  visualization_style: string | null;
  created_at: string;
}

type CreateOutfitInput = {
  items: string[];
  visualizationStyle: string;
  name?: string;
  isFavorite?: boolean;
  tryOnImageBase64?: string | null;
};

async function uploadTryOnImage({
  userId,
  tryOnImageBase64,
}: {
  userId: string;
  tryOnImageBase64: string;
}): Promise<string> {
  const base64Data = tryOnImageBase64.replace(/^data:image\/\w+;base64,/, '');
  const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const fileName = `${userId}/${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from('tryon-images')
    .upload(fileName, bytes, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('tryon-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

function mapDbOutfitToOutfit(data: any): Outfit {
  return {
    ...data,
    try_on_images: data.try_on_images as TryOnImages | null,
  };
}

export function useOutfits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = useCallback(async () => {
    if (!user) {
      setOutfits([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutfits((data || []).map(mapDbOutfitToOutfit));
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const createOutfit = useCallback(
    async ({ items, visualizationStyle, name, isFavorite, tryOnImageBase64 }: CreateOutfitInput): Promise<Outfit | null> => {
      if (!user) return null;

      try {
        let tryOnImageUrl: string | null = null;

        if (tryOnImageBase64) {
          tryOnImageUrl = await uploadTryOnImage({ userId: user.id, tryOnImageBase64 });
        }

        const { data, error } = await supabase
          .from('outfits')
          .insert({
            user_id: user.id,
            items,
            name: name || `Look ${new Date().toLocaleDateString('en-US')}`,
            try_on_image_url: tryOnImageUrl,
            visualization_style: visualizationStyle,
            is_favorite: Boolean(isFavorite),
          })
          .select()
          .single();

        if (error) throw error;

        const outfit = mapDbOutfitToOutfit(data);
        setOutfits((prev) => [outfit, ...prev]);
        return outfit;
      } catch (error) {
        console.error('Error creating outfit:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Unable to save the look',
        });
        return null;
      }
    },
    [toast, user]
  );

  // Backwards compatible helper for the current UI (Save button)
  const saveOutfit = useCallback(
    async (items: string[], tryOnImageBase64: string | null, visualizationStyle: string, name?: string) => {
      return createOutfit({
        items,
        visualizationStyle,
        name,
        isFavorite: true,
        tryOnImageBase64,
      });
    },
    [createOutfit]
  );

  const toggleFavorite = useCallback(
    async (outfitId: string) => {
      const outfit = outfits.find((o) => o.id === outfitId);
      if (!outfit) return;

      try {
        const { error } = await supabase
          .from('outfits')
          .update({ is_favorite: !outfit.is_favorite })
          .eq('id', outfitId);

        if (error) throw error;

        setOutfits((prev) => prev.map((o) => (o.id === outfitId ? { ...o, is_favorite: !o.is_favorite } : o)));
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    },
    [outfits]
  );

  const deleteOutfit = useCallback(async (outfitId: string) => {
    try {
      const { error } = await supabase.from('outfits').delete().eq('id', outfitId);
      if (error) throw error;

      setOutfits((prev) => prev.filter((o) => o.id !== outfitId));
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  }, []);

  // Update outfit with all 3 generated images
  const updateOutfitImages = useCallback(
    async (outfitId: string, images: TryOnImages, primaryStyle: keyof TryOnImages) => {
      try {
        const primaryImage = images[primaryStyle];
        const { error } = await supabase
          .from('outfits')
          .update({
            try_on_images: images as any,
            try_on_image_url: primaryImage,
            visualization_style: primaryStyle,
          })
          .eq('id', outfitId);

        if (error) throw error;

        setOutfits((prev) =>
          prev.map((o) =>
            o.id === outfitId
              ? { ...o, try_on_images: images, try_on_image_url: primaryImage, visualization_style: primaryStyle }
              : o
          )
        );
      } catch (error) {
        console.error('Error updating outfit images:', error);
      }
    },
    []
  );

  // Schedule outfit to a specific date
  const scheduleOutfit = useCallback(
    async (outfitId: string, date: string) => {
      try {
        const { error } = await supabase
          .from('outfits')
          .update({ scheduled_date: date })
          .eq('id', outfitId);

        if (error) throw error;

        setOutfits((prev) =>
          prev.map((o) => (o.id === outfitId ? { ...o, scheduled_date: date } : o))
        );

        toast({
          title: 'Look scheduled',
          description: `Scheduled for ${date}`,
        });
      } catch (error) {
        console.error('Error scheduling outfit:', error);
      }
    },
    [toast]
  );

  const favoriteOutfits = useMemo(() => outfits.filter((o) => o.is_favorite), [outfits]);

  return {
    outfits,
    favoriteOutfits,
    loading,
    createOutfit,
    saveOutfit,
    toggleFavorite,
    deleteOutfit,
    updateOutfitImages,
    scheduleOutfit,
    refetch: fetchOutfits,
  };
}
