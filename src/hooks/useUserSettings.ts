
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UserSettings {
  id: string;
  user_id: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  currency?: string;
  dark_mode?: boolean;
  compact_view?: boolean;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }

      setSettings(data || null);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user?.id || !settings) {
      console.log('No user or settings available for update');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }
      
      await fetchSettings();
      
      toast({
        title: "Configuración actualizada",
        description: "Tus configuraciones han sido guardadas correctamente.",
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
}
