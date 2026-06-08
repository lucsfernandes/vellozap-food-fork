import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, Calculator, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { useDeliveryZones, type DeliveryZone } from "@/hooks/useDeliveryZones";
import { useRestaurantProfile } from "@/hooks/useRestaurantProfile";

interface DeliveryCalculationResult {
  distance: number;
  zone: DeliveryZone | null;
  deliveryFee: number;
  canDeliver: boolean;
  message: string;
}

const DeliveryZoneManager = () => {
  const { profile } = useRestaurantProfile();
  const { zones: deliveryZones, loading, saveZones, calculate } = useDeliveryZones();

  const [restaurantCep, setRestaurantCep] = useState("");
  const [testCustomerCep, setTestCustomerCep] = useState("");
  const [calculationResult, setCalculationResult] = useState<DeliveryCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newZone, setNewZone] = useState({
    minDistance: "",
    maxDistance: "",
    price: "",
    description: "",
  });

  const { toast } = useToast();

  // O endereço/CEP de origem vem do perfil do restaurante (usado como ponto de origem).
  useEffect(() => {
    if (profile?.address) {
      setRestaurantCep(profile.address);
    }
  }, [profile?.address]);

  const handleCalculateDelivery = async () => {
    if (!testCustomerCep.trim()) {
      toast({
        title: "CEP obrigatório",
        description: "Digite o CEP do cliente para calcular a entrega.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculate({
        originCep: restaurantCep || undefined,
        customerCep: testCustomerCep,
      });

      if (!result) {
        return;
      }

      setCalculationResult(result);
      toast({
        title: result.canDeliver ? "Entrega disponível!" : "Fora da área de entrega",
        description: `Distância: ${result.distance}km - ${result.message}`,
        variant: result.canDeliver ? "default" : "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const addDeliveryZone = async () => {
    if (!newZone.minDistance || !newZone.maxDistance || !newZone.price || !newZone.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar uma nova faixa.",
        variant: "destructive",
      });
      return;
    }

    const zone: DeliveryZone = {
      id: Date.now().toString(),
      minDistance: parseFloat(newZone.minDistance),
      maxDistance: parseFloat(newZone.maxDistance),
      price: parseFloat(newZone.price),
      description: newZone.description,
    };

    const next = [...deliveryZones, zone].sort((a, b) => a.minDistance - b.minDistance);
    setIsSaving(true);
    const ok = await saveZones(next);
    setIsSaving(false);
    if (ok) {
      setNewZone({ minDistance: "", maxDistance: "", price: "", description: "" });
    }
  };

  const removeDeliveryZone = async (id: string) => {
    const next = deliveryZones.filter((zone) => zone.id !== id);
    setIsSaving(true);
    await saveZones(next);
    setIsSaving(false);
  };

  const formatCepInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
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
                onChange={(e) => setRestaurantCep(e.target.value)}
                placeholder="00000-000"
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                </div>
              ) : deliveryZones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma faixa de entrega cadastrada. Adicione uma faixa abaixo.
                </p>
              ) : (
                deliveryZones.map((zone) => (
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
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
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
              <Button onClick={addDeliveryZone} disabled={isSaving} className="mt-3" size="sm">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryZoneManager;
