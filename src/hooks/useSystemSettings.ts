
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SystemSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export function useSystemSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      console.log('No user ID available for system settings');
      setLoading(false);
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.log('Invalid user ID format for system settings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching system settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching system settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Crear configuraciones por defecto
        const { data: newSettings, error: insertError } = await supabase
          .from('system_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default system settings:', insertError);
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

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    if (!user?.id || !settings) {
      console.log('No user or settings available for update');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating system settings:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar las configuraciones del sistema.",
          variant: "destructive"
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones del sistema han sido actualizadas.",
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
