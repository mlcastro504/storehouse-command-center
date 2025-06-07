
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserNotificationSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export function useNotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching notification settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Crear configuraciones por defecto
        const { data: newSettings, error: insertError } = await supabase
          .from('user_notification_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default notification settings:', insertError);
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

  const updateSettings = async (updates: Partial<UserNotificationSettings>) => {
    if (!user?.id || !settings) {
      console.log('No user or settings available for update');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification settings:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar las configuraciones de notificaciones.",
          variant: "destructive"
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias de notificaciones han sido actualizadas.",
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
