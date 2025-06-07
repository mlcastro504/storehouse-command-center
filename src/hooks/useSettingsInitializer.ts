
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useSettingsInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const initializeUserSettings = async () => {
      try {
        // Check and create user_settings if not exists
        const { data: userSettings, error: userSettingsError } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userSettingsError && userSettingsError.code === 'PGRST116') {
          await supabase
            .from('user_settings')
            .insert({ user_id: user.id });
        }

        // Check and create user_profiles if not exists
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userProfileError && userProfileError.code === 'PGRST116') {
          await supabase
            .from('user_profiles')
            .insert({ 
              user_id: user.id,
              email: user.email
            });
        }

        // Check and create user_security_settings if not exists
        const { data: securitySettings, error: securityError } = await supabase
          .from('user_security_settings')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (securityError && securityError.code === 'PGRST116') {
          await supabase
            .from('user_security_settings')
            .insert({ user_id: user.id });
        }

        // Check and create user_notification_settings if not exists
        const { data: notificationSettings, error: notificationError } = await supabase
          .from('user_notification_settings')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (notificationError && notificationError.code === 'PGRST116') {
          await supabase
            .from('user_notification_settings')
            .insert({ user_id: user.id });
        }

        // Check and create system_settings if not exists
        const { data: systemSettings, error: systemError } = await supabase
          .from('system_settings')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (systemError && systemError.code === 'PGRST116') {
          await supabase
            .from('system_settings')
            .insert({ user_id: user.id });
        }

      } catch (error) {
        console.error('Error initializing user settings:', error);
      }
    };

    initializeUserSettings();
  }, [user?.id]);
}
