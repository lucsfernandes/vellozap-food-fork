
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';
import WelcomeStep from './onboarding/WelcomeStep';
import RestaurantInfoStep from './onboarding/RestaurantInfoStep';
import ProductsStep from './onboarding/ProductsStep';
import TeamStep from './onboarding/TeamStep';
import WhatsAppStep from './onboarding/WhatsAppStep';
import CompletionStep from './onboarding/CompletionStep';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingFlow = ({ isOpen, onClose }: OnboardingFlowProps) => {
  const {
    currentStep,
    steps,
    loading,
    nextStep,
    prevStep,
    markStepComplete,
    completeOnboarding,
    isLastStep,
    isFirstStep
  } = useOnboarding();
  
  const [canProceed, setCanProceed] = useState(true);
  const navigate = useNavigate();

  const handleNext = async () => {
    const currentStepData = steps[currentStep];
    
    if (currentStepData.name !== 'welcome' && currentStepData.name !== 'completion') {
      await markStepComplete(currentStepData.name);
    }
    
    if (isLastStep) {
      await completeOnboarding();
      onClose();
      navigate('/dashboard');
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      onClose();
      navigate('/dashboard');
    } else {
      nextStep();
    }
  };

  const renderStepContent = () => {
    const stepName = steps[currentStep]?.name;
    
    switch (stepName) {
      case 'welcome':
        return <WelcomeStep />;
      case 'restaurant_info':
        return <RestaurantInfoStep onValidChange={setCanProceed} />;
      case 'products':
        return <ProductsStep onValidChange={setCanProceed} />;
      case 'team':
        return <TeamStep onValidChange={setCanProceed} />;
      case 'whatsapp':
        return <WhatsAppStep onValidChange={setCanProceed} />;
      case 'completion':
        return <CompletionStep />;
      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  if (loading) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="space-y-6">
          {/* Header com progresso */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-orange-600">
                {steps[currentStep]?.title}
              </h1>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} de {steps.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-muted-foreground">
              {steps[currentStep]?.description}
            </p>
          </div>

          {/* Conteúdo da etapa */}
          <div className="min-h-[400px] overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Botões de navegação */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              Anterior
            </Button>
            
            <div className="space-x-2">
              {!isLastStep && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                >
                  Pular por agora
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLastStep ? 'Ir para o Dashboard' : 'Próximo'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;
