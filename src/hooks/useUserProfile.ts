
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export function useUserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Crear perfil por defecto si no existe
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{ 
            user_id: user.id,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            email: user.email || ''
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default profile:', insertError);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profile) {
      console.log('No user or profile available for update');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil.",
          variant: "destructive"
        });
        return;
      }

      setProfile(data);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios en tu perfil se han guardado correctamente.",
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
}
