
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Utensils, Users, MessageSquare, ShoppingBag } from 'lucide-react';

const WelcomeStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6">
          <Utensils className="h-16 w-16 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">
          Bem-vindo ao VelloZap! 🎉
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sua plataforma completa para gerenciar pedidos via WhatsApp. 
          Vamos configurar seu restaurante em poucos passos simples.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Utensils className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Configure seu Restaurante</h3>
            <p className="text-sm text-muted-foreground">
              Adicione informações básicas, logo e horários de funcionamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Cadastre seu Cardápio</h3>
            <p className="text-sm text-muted-foreground">
              Adicione produtos, preços e descrições atrativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Monte sua Equipe</h3>
            <p className="text-sm text-muted-foreground">
              Adicione funcionários e defina responsabilidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Conecte o WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
              Configure seu número para receber pedidos automaticamente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900">Processo Rápido e Simples</h4>
            <p className="text-sm text-orange-700 mt-1">
              Todo o processo leva apenas alguns minutos. Você pode pular etapas e voltar depois se preferir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
