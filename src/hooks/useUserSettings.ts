
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Crear configuraciones por defecto si no existen
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default settings:', insertError);
        } else {
          setSettings(newSettings);
        }
      }
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
      const { data, error } = await supabase
        .from('user_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar las configuraciones.",
          variant: "destructive"
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado correctamente.",
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
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
