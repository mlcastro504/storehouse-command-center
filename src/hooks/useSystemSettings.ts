
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SystemSettings {
  id: string;
  user_id: string;
  maintenance_mode?: boolean;
  debug_mode?: boolean;
  cache_enabled?: boolean;
  session_timeout_minutes?: number;
  api_rate_limit?: number;
  backup_frequency?: string;
  log_level?: string;
  created_at: string;
  updated_at: string;
}

export function useSystemSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching system settings:', error);
        return;
      }

      setSettings(data || null);
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
      const { error } = await supabase
        .from('system_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating system settings:', error);
        throw error;
      }
      
      await fetchSettings();
      
      toast({
        title: "Configuración actualizada",
        description: "Las configuraciones del sistema han sido actualizadas.",
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
