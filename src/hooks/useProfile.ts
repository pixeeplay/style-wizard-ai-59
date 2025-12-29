import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type StyleType = 'casual' | 'formal' | 'sport' | 'business' | 'evening' | 'vacation';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  morphology: 'rectangle' | 'hourglass' | 'inverted_triangle' | 'triangle' | 'oval' | 'athletic' | null;
  style_preferences: StyleType[] | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data as Profile);
    return data as Profile;
  };

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
