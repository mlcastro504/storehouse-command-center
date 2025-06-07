
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default profile if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_profiles')
          .insert({ 
            user_id: user.id,
            email: user.email
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return;
        }
        data = newData;
      } else if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      console.log('No user available for update');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      
      await fetchProfile();
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive"
      });
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
