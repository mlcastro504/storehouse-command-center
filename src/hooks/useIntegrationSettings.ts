
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integration settings:', error);
        setSettings([]);
      } else {
        setSettings(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      setSettings([]);
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
      const { error } = await supabase
        .from('integration_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating integration setting:', error);
        throw error;
      }
      
      await fetchSettings(); // Refresh from database
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de integración ha sido actualizada.",
      });
    } catch (error) {
      console.error('Error in updateSetting:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive"
      });
    }
  };

  const createSetting = async (setting: Omit<IntegrationSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      console.log('No user available for create');
      return;
    }

    try {
      const newSetting = {
        ...setting,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('integration_settings')
        .insert([newSetting]);

      if (error) {
        console.error('Error creating integration setting:', error);
        throw error;
      }

      await fetchSettings(); // Refresh from database

      toast({
        title: "Configuración creada",
        description: "La configuración de integración ha sido creada.",
      });
    } catch (error) {
      console.error('Error in createSetting:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la configuración.",
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
    updateSetting,
    createSetting,
    refetch: fetchSettings
  };
}
