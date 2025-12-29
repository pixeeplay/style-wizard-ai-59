import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
  visualization_style: string | null;
  created_at: string;
}

export function useOutfits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async () => {
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
      setOutfits((data as Outfit[]) || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  const saveOutfit = async (
    items: string[],
    tryOnImageBase64: string | null,
    visualizationStyle: string,
    name?: string
  ): Promise<Outfit | null> => {
    if (!user) return null;

    try {
      let tryOnImageUrl: string | null = null;

      // Upload try-on image if provided
      if (tryOnImageBase64) {
        const base64Data = tryOnImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const fileName = `${user.id}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from('tryon-images')
          .upload(fileName, bytes, {
            contentType: 'image/png',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('tryon-images')
          .getPublicUrl(fileName);
        
        tryOnImageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          items,
          name: name || `Look ${new Date().toLocaleDateString('fr-FR')}`,
          try_on_image_url: tryOnImageUrl,
          visualization_style: visualizationStyle,
          is_favorite: true,
        })
        .select()
        .single();

      if (error) throw error;

      setOutfits(prev => [data as Outfit, ...prev]);
      return data as Outfit;
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder le look',
      });
      return null;
    }
  };

  const toggleFavorite = async (outfitId: string) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    try {
      const { error } = await supabase
        .from('outfits')
        .update({ is_favorite: !outfit.is_favorite })
        .eq('id', outfitId);

      if (error) throw error;

      setOutfits(prev =>
        prev.map(o =>
          o.id === outfitId ? { ...o, is_favorite: !o.is_favorite } : o
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteOutfit = async (outfitId: string) => {
    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (error) throw error;

      setOutfits(prev => prev.filter(o => o.id !== outfitId));
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  };

  const favoriteOutfits = outfits.filter(o => o.is_favorite);

  return {
    outfits,
    favoriteOutfits,
    loading,
    saveOutfit,
    toggleFavorite,
    deleteOutfit,
    refetch: fetchOutfits,
  };
}
