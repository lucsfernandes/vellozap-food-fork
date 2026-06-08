
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface OnboardingStep {
  id: string;
  name: string;
  title: string;
  description: string;
  completed: boolean;
}

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      name: 'welcome',
      title: 'Bem-vindo ao VelloZap!',
      description: 'Vamos configurar seu restaurante em poucos passos',
      completed: false
    },
    {
      id: 'restaurant_info',
      name: 'restaurant_info',
      title: 'Informações do Restaurante',
      description: 'Configure os dados básicos do seu restaurante',
      completed: false
    },
    {
      id: 'products',
      name: 'products',
      title: 'Cadastro de Produtos',
      description: 'Adicione pelo menos um produto ao seu cardápio',
      completed: false
    },
    {
      id: 'team',
      name: 'team',
      title: 'Configurar Equipe',
      description: 'Adicione membros da sua equipe (opcional)',
      completed: false
    },
    {
      id: 'whatsapp',
      name: 'whatsapp',
      title: 'Conectar WhatsApp',
      description: 'Configure seu número para receber pedidos',
      completed: false
    },
    {
      id: 'completion',
      name: 'completion',
      title: 'Parabéns!',
      description: 'Seu restaurante está pronto para receber pedidos',
      completed: false
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadOnboardingProgress();
    }
  }, [user]);

  const loadOnboardingProgress = async () => {
    try {
      const { data } = await apiClient.get<{
        steps: Array<{ step_name: string; completed: boolean; completed_at: string | null }>;
      }>('/onboarding/progress');

      const updatedSteps = steps.map(step => {
        const progress = data.steps.find(p => p.step_name === step.name);
        return {
          ...step,
          completed: progress?.completed || false
        };
      });

      setSteps(updatedSteps);
      
      // Find the first incomplete step
      const firstIncompleteIndex = updatedSteps.findIndex(step => !step.completed);
      if (firstIncompleteIndex !== -1) {
        setCurrentStep(firstIncompleteIndex);
      } else {
        setCurrentStep(updatedSteps.length - 1);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = async (stepName: string) => {
    try {
      await apiClient.post(`/onboarding/progress/${stepName}/complete`, {});

      setSteps(prev => prev.map(step =>
        step.name === stepName ? { ...step, completed: true } : step
      ));

      return true;
    } catch (error) {
      console.error('Error marking step complete:', error);
      return false;
    }
  };

  const completeOnboarding = async () => {
    try {
      await apiClient.post('/onboarding/complete', {});

      toast({
        title: "Onboarding concluído!",
        description: "Seu restaurante está pronto para receber pedidos.",
      });

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  return {
    currentStep,
    steps,
    loading,
    nextStep,
    prevStep,
    goToStep,
    markStepComplete,
    completeOnboarding,
    isLastStep: currentStep === steps.length - 1,
    isFirstStep: currentStep === 0
  };
};
