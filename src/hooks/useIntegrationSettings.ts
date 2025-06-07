
import { useState, useEffect } from 'react';
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
      
      // Por ahora simulamos datos mientras la tabla se sincroniza
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
      // Actualizar localmente por ahora
      setSettings(prev => prev.map(s => s.id === settingId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
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
      const newSetting: IntegrationSetting = {
        ...setting,
        id: Date.now().toString(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSettings(prev => [...prev, newSetting]);
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
