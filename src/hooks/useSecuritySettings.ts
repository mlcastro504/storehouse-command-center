

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserSecuritySettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export function useSecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;

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

      if (data) {
        setSettings(data);
      } else {
        // Crear configuraciones por defecto
        const { data: newSettings, error: insertError } = await supabase
          .from('user_security_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default security settings:', insertError);
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

  const updateSettings = async (updates: Partial<UserSecuritySettings>) => {
    if (!user || !settings) return;

    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating security settings:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar las configuraciones de seguridad.",
          variant: "destructive"
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Configuración de seguridad guardada",
        description: "Los cambios se han aplicado correctamente.",
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
}

