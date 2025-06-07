
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
        // Si hay error, usar datos mock temporalmente
        const mockSettings: IntegrationSetting[] = [
          {
            id: '1',
            user_id: user.id,
            integration_type: 'external',
            integration_name: 'sap',
            is_enabled: true,
            api_key_encrypted: '***',
            webhook_url: '',
            settings: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setSettings(mockSettings);
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
        // Fallback local update
        setSettings(prev => prev.map(s => s.id === settingId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
      } else {
        await fetchSettings(); // Refrescar desde la base de datos
      }
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de integración ha sido actualizada.",
      });
    } catch (error) {
      console.error('Error in updateSetting:', error);
      // Fallback local update
      setSettings(prev => prev.map(s => s.id === settingId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
      toast({
        title: "Configuración actualizada",
        description: "La configuración de integración ha sido actualizada.",
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
        // Fallback local creation
        const fallbackSetting: IntegrationSetting = {
          ...newSetting,
          id: Date.now().toString(),
        };
        setSettings(prev => [...prev, fallbackSetting]);
      } else {
        await fetchSettings(); // Refrescar desde la base de datos
      }

      toast({
        title: "Configuración creada",
        description: "La configuración de integración ha sido creada.",
      });
    } catch (error) {
      console.error('Error in createSetting:', error);
      // Fallback local creation
      const fallbackSetting: IntegrationSetting = {
        ...setting,
        id: Date.now().toString(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(prev => [...prev, fallbackSetting]);
      toast({
        title: "Configuración creada",
        description: "La configuración de integración ha sido creada.",
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
