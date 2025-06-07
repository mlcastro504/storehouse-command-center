
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  session_timeout: boolean;
  email_notifications: boolean;
  login_alerts: boolean;
  two_factor_secret?: string;
  created_at: string;
  updated_at: string;
}

export function useSecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching security settings:', error);
        return;
      }

      setSettings(data || null);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SecuritySettings>) => {
    if (!user?.id || !settings) {
      console.log('No user or settings available for update');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_security_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating security settings:', error);
        throw error;
      }
      
      await fetchSettings();
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de seguridad ha sido actualizada.",
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
