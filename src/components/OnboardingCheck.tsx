
import { useEffect } from 'react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const OnboardingCheck = () => {
  const { user } = useAuth();
  const { profile, loading } = useRestaurantProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Se o usuário está logado e tem perfil, redirecionar para o dashboard
      // O onboarding será mostrado automaticamente lá se necessário
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  return null;
};

export default OnboardingCheck;
