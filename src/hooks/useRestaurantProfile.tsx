
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface RestaurantProfile {
  id: string;
  restaurant_name: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  responsible_name: string | null;
  cnpj: string | null;
  email: string | null;
  delivery_type: string | null;
  whatsapp_number: string | null;
  delivery_radius: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useRestaurantProfile = () => {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do restaurante.",
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<RestaurantProfile>) => {
    try {
      const { error } = await supabase
        .from('restaurant_profiles')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar as informações.",
          variant: "destructive",
        });
        return false;
      } else {
        await fetchProfile(); // Recarregar os dados
        toast({
          title: "Perfil atualizado",
          description: "As informações foram salvas com sucesso.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};
