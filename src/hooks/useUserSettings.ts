
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
    // Para el sistema mock, crear configuraciones por defecto
    if (!user?.id) {
      console.log('No user ID available, using default settings');
      const defaultSettings: UserSettings = {
        id: '1',
        user_id: user?.id || '1',
        company_name: 'Mi Empresa',
        language: 'es',
        timezone: 'America/Mexico_City',
        currency: 'MXN',
        date_format: 'dd/MM/yyyy',
        dark_mode: false,
        compact_view: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching user settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        // Usar configuraciones por defecto si hay error
        const defaultSettings: UserSettings = {
          id: '1',
          user_id: user.id,
          company_name: 'Mi Empresa',
          language: 'es',
          timezone: 'America/Mexico_City',
          currency: 'MXN',
          date_format: 'dd/MM/yyyy',
          dark_mode: false,
          compact_view: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Crear configuraciones por defecto
        const defaultSettings = {
          user_id: user.id,
          company_name: 'Mi Empresa',
          language: 'es',
          timezone: 'America/Mexico_City',
          currency: 'MXN',
          date_format: 'dd/MM/yyyy',
          dark_mode: false,
          compact_view: false
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default user settings:', insertError);
          // Si falla la inserción, usar configuraciones locales
          setSettings({
            id: '1',
            ...defaultSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserSettings);
        } else {
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      // Fallback a configuraciones por defecto
      const defaultSettings: UserSettings = {
        id: '1',
        user_id: user.id,
        company_name: 'Mi Empresa',
        language: 'es',
        timezone: 'America/Mexico_City',
        currency: 'MXN',
        date_format: 'dd/MM/yyyy',
        dark_mode: false,
        compact_view: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(defaultSettings);
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
        console.error('Error updating user settings:', error);
        // Actualizar localmente si falla la base de datos
        setSettings(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
        toast({
          title: "Configuración guardada localmente",
          description: "Las configuraciones se guardaron localmente.",
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones han sido actualizadas.",
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
      // Actualizar localmente como fallback
      setSettings(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
      toast({
        title: "Configuración guardada localmente",
        description: "Las configuraciones se guardaron localmente.",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user?.id]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
}
