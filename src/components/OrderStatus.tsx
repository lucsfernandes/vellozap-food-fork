
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Truck } from "lucide-react";

interface OrderStatusProps {
  orderNumber: string;
  status: "received" | "preparing" | "delivering" | "delivered";
  onNewOrder: () => void;
}

const OrderStatus = ({ orderNumber, status, onNewOrder }: OrderStatusProps) => {
  const statusInfo = {
    received: { text: "Pedido Recebido", icon: CheckCircle, color: "text-green-500" },
    preparing: { text: "Em Preparo", icon: Clock, color: "text-yellow-500" },
    delivering: { text: "Saiu para Entrega", icon: Truck, color: "text-blue-500" },
    delivered: { text: "Entregue", icon: CheckCircle, color: "text-green-500" }
  };

  const currentStatus = statusInfo[status];
  const Icon = currentStatus.icon;

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Pedido #{orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className={`inline-flex items-center space-x-2 ${currentStatus.color}`}>
            <Icon className="h-6 w-6" />
            <span className="text-lg font-semibold">{currentStatus.text}</span>
          </div>
          
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${status === "received" || status === "preparing" || status === "delivering" || status === "delivered" ? "text-green-500" : "text-gray-300"}`}>
              <CheckCircle className="h-4 w-4" />
              <span>Pedido Recebido</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === "preparing" || status === "delivering" || status === "delivered" ? "text-green-500" : "text-gray-300"}`}>
              <Clock className="h-4 w-4" />
              <span>Em Preparo</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === "delivering" || status === "delivered" ? "text-green-500" : "text-gray-300"}`}>
              <Truck className="h-4 w-4" />
              <span>Saiu para Entrega</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === "delivered" ? "text-green-500" : "text-gray-300"}`}>
              <CheckCircle className="h-4 w-4" />
              <span>Entregue</span>
            </div>
          </div>

          {status === "delivered" && (
            <Button onClick={onNewOrder} className="w-full vello-gradient hover:opacity-90">
              Fazer Novo Pedido
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatus;
