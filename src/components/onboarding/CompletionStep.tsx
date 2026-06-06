
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, Zap, Users, MessageSquare } from 'lucide-react';

const CompletionStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">
          Parabéns! 🎉
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Seu restaurante foi configurado com sucesso! Agora você está pronto 
          para receber pedidos via WhatsApp e gerenciar tudo pelo dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card className="border-green-200">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2 text-green-900">Sistema Ativo</h3>
            <p className="text-sm text-green-700">
              Seu sistema está funcionando e pronto para receber pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2 text-blue-900">WhatsApp Conectado</h3>
            <p className="text-sm text-blue-700">
              Clientes podem fazer pedidos diretamente pelo WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2 text-orange-900">Cardápio Online</h3>
            <p className="text-sm text-orange-700">
              Seus produtos estão disponíveis no cardápio digital
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2 text-purple-900">Equipe Organizada</h3>
            <p className="text-sm text-purple-700">
              Sua equipe pode acompanhar e gerenciar os pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 mt-8">
        <h4 className="font-semibold text-orange-900 mb-4 text-center">🎯 O que você pode fazer agora:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2">
            <li className="flex items-start space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Acessar o dashboard para ver pedidos</span>
            </li>
            <li className="flex items-start space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Adicionar mais produtos ao cardápio</span>
            </li>
            <li className="flex items-start space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Compartilhar link do cardápio</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Configurar promoções e descontos</span>
            </li>
            <li className="flex items-start space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Ajustar horários de funcionamento</span>
            </li>
            <li className="flex items-start space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Fazer o primeiro teste de pedido</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-600 text-white rounded-lg p-6 text-center">
        <h4 className="font-semibold mb-2">💬 Precisa de ajuda?</h4>
        <p className="text-sm opacity-90">
          Estamos aqui para ajudar! Entre em contato conosco se tiver dúvidas 
          ou precisar de suporte para configurar algo específico.
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;
