import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WardrobeItem {
  id: string;
  user_id: string;
  image_url: string;
  name: string | null;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory' | 'underwear' | 'swimwear' | 'sportswear';
  color: string;
  secondary_color: string | null;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
  style: 'casual' | 'formal' | 'sport' | 'business' | 'evening' | 'vacation';
  brand: string | null;
  status: 'available' | 'laundry';
  notes: string | null;
  wear_count: number;
  last_worn_at: string | null;
  created_at: string;
  updated_at: string;
  purchase_price: number | null;
}

export function useWardrobe() {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wardrobe')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data as WardrobeItem[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'wear_count' | 'last_worn_at'>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('wardrobe')
      .insert({
        ...item,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setItems(prev => [data as WardrobeItem, ...prev]);
    return data as WardrobeItem;
  };

  const updateItem = async (id: string, updates: Partial<WardrobeItem>) => {
    const { data, error } = await supabase
      .from('wardrobe')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setItems(prev => prev.map(item => item.id === id ? data as WardrobeItem : item));
    return data as WardrobeItem;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('wardrobe')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleLaundry = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const newStatus = item.status === 'available' ? 'laundry' : 'available';
    return updateItem(id, { status: newStatus });
  };

  const availableItems = items.filter(item => item.status === 'available');
  const laundryItems = items.filter(item => item.status === 'laundry');

  return {
    items,
    availableItems,
    laundryItems,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleLaundry,
    refetch: fetchItems,
  };
}
