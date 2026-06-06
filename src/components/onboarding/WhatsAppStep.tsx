
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { MessageSquare, Phone, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppStepProps {
  onValidChange: (isValid: boolean) => void;
}

const WhatsAppStep = ({ onValidChange }: WhatsAppStepProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const { profile, updateProfile } = useRestaurantProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.whatsapp_number) {
      setWhatsappNumber(profile.whatsapp_number);
    }
  }, [profile]);

  useEffect(() => {
    const isValid = whatsappNumber.trim() !== '';
    onValidChange(isValid);

    // Auto-save changes
    if (isValid) {
      const timeoutId = setTimeout(() => {
        updateProfile({ whatsapp_number: whatsappNumber });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [whatsappNumber, onValidChange, updateProfile]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência.",
    });
  };

  const testWhatsApp = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const message = encodeURIComponent("Olá! Este é um teste de conexão do VelloZap.");
      const url = `https://wa.me/${cleanNumber}?text=${message}`;
      window.open(url, '_blank');
    }
  };

  const menuLink = profile?.restaurant_name 
    ? `${window.location.origin}/menu?restaurant=${encodeURIComponent(profile.restaurant_name)}`
    : `${window.location.origin}/menu`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            <span>Conectar WhatsApp</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Como funciona?</h4>
                <p className="text-sm text-green-700 mt-1">
                  Seus clientes acessarão seu cardápio online e, ao finalizar o pedido, 
                  serão direcionados para o WhatsApp com o pedido já formatado.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número do WhatsApp *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Inclua o código do país. Ex: +5511999999999 ou (11) 99999-9999
              </p>
            </div>

            {whatsappNumber && (
              <Button
                variant="outline"
                onClick={testWhatsApp}
                className="w-full flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Testar Conexão</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link do seu Cardápio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este é o link que seus clientes irão acessar para ver o cardápio e fazer pedidos:
          </p>
          
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm">{menuLink}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(menuLink)}
              className="flex items-center space-x-1"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Como compartilhar:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Copie o link e envie para seus clientes via WhatsApp</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Adicione às suas redes sociais (Instagram, Facebook)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Coloque em cartões de visita ou materiais impressos</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Use como bio link no Instagram</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-900 mb-2">🚀 Próximos passos após a configuração:</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Teste fazendo um pedido pelo seu próprio cardápio</li>
          <li>• Configure mensagens automáticas de confirmação</li>
          <li>• Treine sua equipe para responder os pedidos</li>
          <li>• Compartilhe o link do cardápio com seus clientes</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppStep;
