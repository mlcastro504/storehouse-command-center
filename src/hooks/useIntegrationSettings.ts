
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationSetting {
  id: string;
  user_id: string;
  integration_type: string;
  integration_name: string;
  is_enabled: boolean;
  api_key_encrypted?: string;
  webhook_url?: string;
  settings: any;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export function useIntegrationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<IntegrationSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      console.log('No user ID available for integration settings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching integration settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching integration settings:', error);
        return;
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingId: string, updates: Partial<IntegrationSetting>) => {
    if (!user?.id) {
      console.log('No user available for update');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating integration setting:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar la configuración de integración.",
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => prev.map(s => s.id === settingId ? data : s));
      toast({
        title: "Configuración actualizada",
        description: "La configuración de integración ha sido actualizada.",
      });
    } catch (error) {
      console.error('Error in updateSetting:', error);
    }
  };

  const createSetting = async (setting: Omit<IntegrationSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      console.log('No user available for create');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .insert([{ ...setting, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating integration setting:', error);
        toast({
          title: "Error",
          description: "No se pudo crear la configuración de integración.",
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => [...prev, data]);
      toast({
        title: "Configuración creada",
        description: "La configuración de integración ha sido creada.",
      });
    } catch (error) {
      console.error('Error in createSetting:', error);
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
    updateSetting,
    createSetting,
    refetch: fetchSettings
  };
}
