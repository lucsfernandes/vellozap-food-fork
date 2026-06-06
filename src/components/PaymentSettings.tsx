
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Key, Building, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentSettings = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  const { toast } = useToast();

  const [asaasConfig, setAsaasConfig] = useState({
    apiKey: "",
    cnpj: "",
    companyName: "",
    pixEnabled: true,
    creditCardEnabled: false,
    boletoEnabled: false
  });

  const handleSaveConfig = () => {
    if (!asaasConfig.apiKey || !asaasConfig.cnpj || !asaasConfig.companyName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Simular salvamento das configurações
    setIsConnected(true);
    setIsConfigModalOpen(false);
    
    toast({
      title: "Integração ASAAS configurada",
      description: "As configurações foram salvas com sucesso.",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAsaasConfig({
      apiKey: "",
      cnpj: "",
      companyName: "",
      pixEnabled: true,
      creditCardEnabled: false,
      boletoEnabled: false
    });
    
    toast({
      title: "Integração desconectada",
      description: "A conta ASAAS foi desconectada com sucesso.",
    });
  };

  const testConnection = () => {
    // Simular teste de conexão
    toast({
      title: "Testando conexão...",
      description: "Verificando credenciais ASAAS.",
    });

    setTimeout(() => {
      toast({
        title: "Conexão bem-sucedida",
        description: "A integração com ASAAS está funcionando corretamente.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <span>Integração de Pagamento - ASAAS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status da Integração */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium">
                    {isConnected ? "Conta ASAAS Conectada" : "Conta ASAAS Não Conectada"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isConnected 
                      ? `Empresa: ${asaasConfig.companyName} | CNPJ: ${asaasConfig.cnpj}`
                      : "Configure sua conta ASAAS para receber pagamentos"
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {isConnected ? (
                  <>
                    <Button variant="outline" size="sm" onClick={testConnection}>
                      Testar Conexão
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsConfigModalOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsConfigModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Key className="h-4 w-4 mr-2" />
                    Conectar ASAAS
                  </Button>
                )}
              </div>
            </div>

            {/* Modo Sandbox */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <h4 className="font-medium text-blue-900">Modo de Teste (Sandbox)</h4>
                  <p className="text-sm text-blue-700">
                    Ative para testar a integração sem cobranças reais
                  </p>
                </div>
              </div>
              <Switch
                checked={sandboxMode}
                onCheckedChange={setSandboxMode}
              />
            </div>

            {/* Métodos de Pagamento Habilitados */}
            {isConnected && (
              <div className="space-y-4">
                <h4 className="font-medium">Métodos de Pagamento Habilitados</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">PIX</span>
                    <Badge variant={asaasConfig.pixEnabled ? "default" : "secondary"}>
                      {asaasConfig.pixEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Cartão de Crédito</span>
                    <Badge variant={asaasConfig.creditCardEnabled ? "default" : "secondary"}>
                      {asaasConfig.creditCardEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Boleto</span>
                    <Badge variant={asaasConfig.boletoEnabled ? "default" : "secondary"}>
                      {asaasConfig.boletoEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Informações sobre a integração */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Como funciona a integração ASAAS</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Configure sua conta ASAAS com API Key e dados da empresa</li>
                <li>Ao finalizar pedidos, links de pagamento são gerados automaticamente</li>
                <li>Links são enviados via WhatsApp para os clientes</li>
                <li>Status dos pedidos são atualizados automaticamente após o pagamento</li>
                <li>Disponível nos planos Pro e Enterprise</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Configuração */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Configurar Conta ASAAS</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="api_key">API Key ASAAS *</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="$aact_..."
                  value={asaasConfig.apiKey}
                  onChange={(e) => setAsaasConfig({ ...asaasConfig, apiKey: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Encontre sua API Key no painel ASAAS em Configurações → Integrações
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={asaasConfig.cnpj}
                  onChange={(e) => setAsaasConfig({ ...asaasConfig, cnpj: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Razão Social *</Label>
                <Input
                  id="company_name"
                  placeholder="Nome da empresa"
                  value={asaasConfig.companyName}
                  onChange={(e) => setAsaasConfig({ ...asaasConfig, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Métodos de Pagamento</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PIX</Label>
                    <p className="text-sm text-gray-500">Pagamento instantâneo via PIX</p>
                  </div>
                  <Switch
                    checked={asaasConfig.pixEnabled}
                    onCheckedChange={(checked) => setAsaasConfig({ ...asaasConfig, pixEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cartão de Crédito</Label>
                    <p className="text-sm text-gray-500">Pagamento via cartão de crédito</p>
                  </div>
                  <Switch
                    checked={asaasConfig.creditCardEnabled}
                    onCheckedChange={(checked) => setAsaasConfig({ ...asaasConfig, creditCardEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Boleto Bancário</Label>
                    <p className="text-sm text-gray-500">Pagamento via boleto bancário</p>
                  </div>
                  <Switch
                    checked={asaasConfig.boletoEnabled}
                    onCheckedChange={(checked) => setAsaasConfig({ ...asaasConfig, boletoEnabled: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveConfig} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentSettings;
