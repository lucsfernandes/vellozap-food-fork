
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, Calculator, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";

interface DeliveryZone {
  id: string;
  minDistance: number;
  maxDistance: number;
  price: number;
  description: string;
}

interface DeliveryCalculationResult {
  distance: number;
  zone: DeliveryZone | null;
  deliveryFee: number;
  canDeliver: boolean;
  message: string;
}

const DeliveryZoneManager = () => {
  const [restaurantCep, setRestaurantCep] = useState("01310-100");
  const [testCustomerCep, setTestCustomerCep] = useState("");
  const [calculationResult, setCalculationResult] = useState<DeliveryCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([
    {
      id: "1",
      minDistance: 0,
      maxDistance: 3,
      price: 0,
      description: "Entrega grátis"
    },
    {
      id: "2",
      minDistance: 3.01,
      maxDistance: 5,
      price: 5.00,
      description: "Zona próxima"
    },
    {
      id: "3",
      minDistance: 5.01,
      maxDistance: 10,
      price: 10.00,
      description: "Zona intermediária"
    },
    {
      id: "4",
      minDistance: 10.01,
      maxDistance: 20,
      price: 20.00,
      description: "Zona distante"
    }
  ]);

  const [newZone, setNewZone] = useState({
    minDistance: "",
    maxDistance: "",
    price: "",
    description: ""
  });

  const { toast } = useToast();

  // Simulação do cálculo de distância por CEP (API dos Correios/ViaCEP + cálculo)
  const calculateDistance = async (originCep: string, destinationCep: string): Promise<number> => {
    // Simulação - em produção, aqui seria integrado com API real
    // Pode usar ViaCEP para obter coordenadas e calcular distância real
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay da API
    
    // Simulação baseada nos últimos dígitos do CEP para demonstração
    const origin = parseInt(originCep.replace("-", "").slice(-3));
    const destination = parseInt(destinationCep.replace("-", "").slice(-3));
    const mockDistance = Math.abs(origin - destination) / 50; // Gera distância entre 0-20km
    
    return Math.round(mockDistance * 100) / 100; // Arredonda para 2 casas decimais
  };

  const findZoneForDistance = (distance: number): DeliveryZone | null => {
    return deliveryZones.find(zone => 
      distance >= zone.minDistance && distance <= zone.maxDistance
    ) || null;
  };

  const handleCalculateDelivery = async () => {
    if (!testCustomerCep.trim()) {
      toast({
        title: "CEP obrigatório",
        description: "Digite o CEP do cliente para calcular a entrega.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      const distance = await calculateDistance(restaurantCep, testCustomerCep);
      const zone = findZoneForDistance(distance);
      
      const result: DeliveryCalculationResult = {
        distance,
        zone,
        deliveryFee: zone ? zone.price : 0,
        canDeliver: zone !== null,
        message: zone 
          ? `Entrega disponível - ${zone.description}` 
          : "Fora da área de entrega"
      };
      
      setCalculationResult(result);
      
      toast({
        title: result.canDeliver ? "Entrega disponível!" : "Fora da área de entrega",
        description: `Distância: ${distance}km - ${result.message}`,
        variant: result.canDeliver ? "default" : "destructive"
      });
      
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular a distância. Verifique os CEPs informados.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const addDeliveryZone = () => {
    if (!newZone.minDistance || !newZone.maxDistance || !newZone.price || !newZone.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar uma nova faixa.",
        variant: "destructive"
      });
      return;
    }

    const zone: DeliveryZone = {
      id: Date.now().toString(),
      minDistance: parseFloat(newZone.minDistance),
      maxDistance: parseFloat(newZone.maxDistance),
      price: parseFloat(newZone.price),
      description: newZone.description
    };

    setDeliveryZones([...deliveryZones, zone].sort((a, b) => a.minDistance - b.minDistance));
    setNewZone({ minDistance: "", maxDistance: "", price: "", description: "" });
    
    toast({
      title: "Faixa adicionada",
      description: "Nova faixa de entrega criada com sucesso."
    });
  };

  const removeDeliveryZone = (id: string) => {
    setDeliveryZones(deliveryZones.filter(zone => zone.id !== id));
    toast({
      title: "Faixa removida",
      description: "Faixa de entrega removida com sucesso."
    });
  };

  const formatCepInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Configuração do CEP da pizzaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span>CEP da Unidade (Ponto de Origem)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurant-cep">CEP da Pizzaria</Label>
              <Input
                id="restaurant-cep"
                value={restaurantCep}
                onChange={(e) => setRestaurantCep(formatCepInput(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Este será o ponto de origem para calcular todas as entregas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faixas de entrega */}
      <Card>
        <CardHeader>
          <CardTitle>Faixas de Entrega por Distância</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lista de faixas existentes */}
            <div className="space-y-3">
              {deliveryZones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {zone.minDistance}km - {zone.maxDistance}km
                      </Badge>
                      <span className="font-medium">
                        {zone.price === 0 ? "Grátis" : formatCurrency(zone.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({zone.description})
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDeliveryZone(zone.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Formulário para nova faixa */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Adicionar Nova Faixa</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="min-distance">Distância mín. (km)</Label>
                  <Input
                    id="min-distance"
                    type="number"
                    step="0.01"
                    value={newZone.minDistance}
                    onChange={(e) => setNewZone({ ...newZone, minDistance: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="max-distance">Distância máx. (km)</Label>
                  <Input
                    id="max-distance"
                    type="number"
                    step="0.01"
                    value={newZone.maxDistance}
                    onChange={(e) => setNewZone({ ...newZone, maxDistance: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="zone-price">Valor (R$)</Label>
                  <Input
                    id="zone-price"
                    type="number"
                    step="0.01"
                    value={newZone.price}
                    onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="zone-description">Descrição</Label>
                  <Input
                    id="zone-description"
                    value={newZone.description}
                    onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                    placeholder="Ex: Zona próxima"
                  />
                </div>
              </div>
              <Button onClick={addDeliveryZone} className="mt-3" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Faixa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste de cálculo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            <span>Teste de Cálculo de Entrega</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="customer-cep">CEP do Cliente</Label>
                <Input
                  id="customer-cep"
                  value={testCustomerCep}
                  onChange={(e) => setTestCustomerCep(formatCepInput(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
              <div>
                <Button 
                  onClick={handleCalculateDelivery}
                  disabled={isCalculating}
                  className="w-full"
                >
                  {isCalculating ? "Calculando..." : "Calcular Entrega"}
                </Button>
              </div>
            </div>

            {/* Resultado do cálculo */}
            {calculationResult && (
              <div className={`p-4 rounded-lg border ${calculationResult.canDeliver ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start space-x-2">
                  {calculationResult.canDeliver ? (
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${calculationResult.canDeliver ? 'text-green-800' : 'text-red-800'}`}>
                      {calculationResult.message}
                    </h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>Distância calculada:</strong> {calculationResult.distance}km</p>
                      {calculationResult.canDeliver && (
                        <>
                          <p><strong>Faixa de entrega:</strong> {calculationResult.zone?.description}</p>
                          <p><strong>Taxa de entrega:</strong> {
                            calculationResult.deliveryFee === 0 
                              ? "Grátis" 
                              : formatCurrency(calculationResult.deliveryFee)
                          }</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações importantes */}
      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona o cálculo de distância</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>O sistema calcula a distância real entre o CEP da pizzaria e o CEP do cliente</li>
              <li>Com base na distância, aplica automaticamente a taxa de entrega configurada</li>
              <li>Se o endereço estiver fora do raio máximo, o pedido será bloqueado</li>
              <li>As faixas podem ser editadas a qualquer momento para ajustar sua operação</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              * Em produção, será integrado com APIs reais de cálculo de distância (ViaCEP + Google Maps)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryZoneManager;
