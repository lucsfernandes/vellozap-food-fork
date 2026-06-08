
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import type { OrderDetailed } from "@/hooks/useOrders";

interface OrderDetailsModalProps {
  order: OrderDetailed | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  if (!order) return null;

  const shortId = `#${order.id.slice(0, 8)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pedido recebido';
      case 'preparing': return 'Em preparo';
      case 'ready': return 'Saiu para entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido {shortId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>

          {/* Dados do cliente */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Nome:</span>
                <p>{order.customer_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Telefone:</span>
                <p>{order.customer_phone}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-500">Endereço:</span>
                <p>{order.customer_address ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Itens do pedido */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Itens do Pedido</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <span className="font-medium">{item.quantity}x {item.product_name ?? 'Produto'}</span>
                    <p className="text-sm text-gray-500">{formatCurrency(item.unit_price / 100)} cada</p>
                  </div>
                  <span className="font-medium">{formatCurrency(item.total_price / 100)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-semibold">{formatCurrency(order.total_amount / 100)}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Método:</span>
                <p>{order.payment_method ?? '—'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <p>{order.payment_status ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {order.notes && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Observações</h3>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Informações do Pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Horário:</span>
                <p>{formatTime(order.created_at)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">ID do Pedido:</span>
                <p>{order.id}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
