
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface CheckoutProps {
  total: number;
  onPlaceOrder: (orderData: any) => void;
  onBack: () => void;
}

const Checkout = ({ total, onPlaceOrder, onBack }: CheckoutProps) => {
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    number: "",
    complement: "",
    reference: "",
    paymentMethod: "pix"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder(customerData);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Voltar ao Cardápio
        </Button>
        <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={customerData.phone}
                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={customerData.neighborhood}
                onChange={(e) => setCustomerData({...customerData, neighborhood: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Rua</Label>
              <Input
                id="address"
                value={customerData.address}
                onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={customerData.number}
                  onChange={(e) => setCustomerData({...customerData, number: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={customerData.complement}
                  onChange={(e) => setCustomerData({...customerData, complement: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reference">Ponto de referência</Label>
              <Textarea
                id="reference"
                value={customerData.reference}
                onChange={(e) => setCustomerData({...customerData, reference: e.target.value})}
                placeholder="Ex: Próximo ao mercado, casa azul..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={customerData.paymentMethod}
              onValueChange={(value) => setCustomerData({...customerData, paymentMethod: value})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix">PIX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="money" id="money" />
                <Label htmlFor="money">Dinheiro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Cartão na entrega</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total do Pedido:</span>
              <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
            </div>
            <Button type="submit" className="w-full vello-gradient hover:opacity-90 py-3">
              Confirmar Pedido
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Checkout;
