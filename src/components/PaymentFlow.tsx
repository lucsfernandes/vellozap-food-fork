
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, ExternalLink, CheckCircle, Clock, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'expired';
  paymentMethod?: string;
  paymentLink?: string;
  createdAt: string;
}

const PaymentFlow = () => {
  // TODO: integrar geração de cobrança ASAAS quando o endpoint existir
  // Não há endpoint de cobranças/ASAAS no backend ainda; as cobranças derivam
  // de pedidos (orders), que pertencem a outra parte da migração. Até lá,
  // exibimos um estado vazio em vez de dados fabricados.
  const [orders] = useState<Order[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado",
      description: "O link de pagamento foi copiado para a área de transferência.",
    });
  };

  const sendWhatsAppLink = (order: Order) => {
    if (!order.paymentLink) return;
    
    const message = `Olá ${order.customerName}! 🍕\n\nSeu pedido foi confirmado:\n${order.items.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}\n\n💰 Total: R$ ${order.totalAmount.toFixed(2)}\n\n💳 Para finalizar, efetue o pagamento clicando no link abaixo:\n${order.paymentLink}\n\n✅ Após o pagamento, seu pedido entrará na produção!\n\nObrigado pela preferência! 😊`;
    
    const whatsappUrl = `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Mensagem preparada",
      description: "O WhatsApp será aberto com a mensagem e link de pagamento.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "pending": { label: "Aguardando Pagamento", variant: "secondary" as const, color: "bg-yellow-500" },
      "paid": { label: "Pago", variant: "default" as const, color: "bg-green-500" },
      "expired": { label: "Expirado", variant: "destructive" as const, color: "bg-red-500" }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
        <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <span>Fluxo de Pagamentos - Simulação ASAAS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sem cobranças pendentes</h3>
              <p className="text-muted-foreground">
                As cobranças aparecerão aqui assim que a geração de pagamento via ASAAS estiver disponível.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{order.customerName}</h4>
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      <p className="text-sm text-gray-500">{order.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {order.totalAmount.toFixed(2)}</p>
                      {getStatusBadge(order.paymentStatus)}
                    </div>
                  </div>

                  <div className="text-sm">
                    <strong>Itens:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.name} ({item.quantity}x) - R$ {item.price.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>

                  {order.paymentLink && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPaymentLink(order.paymentLink!)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => sendWhatsAppLink(order)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Enviar via WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsPaymentModalOpen(true);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  )}

                  {order.paymentLink && (
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <strong>Link:</strong> <span className="font-mono">{order.paymentLink}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona o fluxo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 rounded-full p-1">
                <span className="text-orange-600 font-bold text-xs">1</span>
              </div>
              <div>
                <strong>Pedido confirmado no WhatsApp</strong>
                <p className="text-gray-600">Cliente confirma itens e dados para entrega</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 rounded-full p-1">
                <span className="text-orange-600 font-bold text-xs">2</span>
              </div>
              <div>
                <strong>Link de pagamento gerado automaticamente</strong>
                <p className="text-gray-600">Sistema cria link via API ASAAS com PIX, cartão ou boleto</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 rounded-full p-1">
                <span className="text-orange-600 font-bold text-xs">3</span>
              </div>
              <div>
                <strong>Link enviado via WhatsApp</strong>
                <p className="text-gray-600">Mensagem automática com link é enviada ao cliente</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 rounded-full p-1">
                <span className="text-orange-600 font-bold text-xs">4</span>
              </div>
              <div>
                <strong>Status atualizado via webhook</strong>
                <p className="text-gray-600">ASAAS confirma pagamento e atualiza status automaticamente</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Pagamento */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Status:</span>
                {getStatusBadge(selectedOrder.paymentStatus)}
              </div>
              
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{selectedOrder.customerName}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">R$ {selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              
              {selectedOrder.paymentMethod && (
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
              )}
              
              {selectedOrder.paymentLink && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Link de Pagamento:</span>
                  <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
                    {selectedOrder.paymentLink}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentFlow;
