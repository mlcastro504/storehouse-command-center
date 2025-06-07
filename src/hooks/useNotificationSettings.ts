
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  in_app_enabled?: boolean;
  email_order_updates?: boolean;
  email_stock_alerts?: boolean;
  email_security_alerts?: boolean;
  email_system_updates?: boolean;
  email_frequency?: string;
  sms_critical_only?: boolean;
  sms_emergency_alerts?: boolean;
  in_app_order_updates?: boolean;
  in_app_stock_alerts?: boolean;
  in_app_task_assignments?: boolean;
  in_app_system_messages?: boolean;
  in_app_sound?: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default settings if they don't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_notification_settings')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating notification settings:', insertError);
          return;
        }
        data = newData;
      } else if (error) {
        console.error('Error fetching notification settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user?.id) {
      console.log('No user available for update');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating notification settings:', error);
        throw error;
      }
      
      await fetchSettings();
      
      toast({
        title: "Configuración actualizada",
        description: "Las configuraciones de notificación han sido actualizadas.",
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
