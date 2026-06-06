
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import ExportPeriodModal from "./ExportPeriodModal";

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  value: number;
  status: string;
  time: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}

interface OrderExportProps {
  orders: Order[];
}

const OrderExport = ({ orders }: OrderExportProps) => {
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const exportToPDF = () => {
    // Simulação de exportação PDF
    const content = orders.map(order => ({
      ID: order.id,
      Cliente: order.customer,
      Telefone: order.phone,
      Endereço: order.address,
      Itens: order.items.map(item => `${item.quantity}x ${item.name} - R$ ${item.total.toFixed(2)}`).join('; '),
      Total: `R$ ${order.value.toFixed(2)}`,
      Status: order.status,
      Horário: order.time,
      Pagamento: order.paymentMethod,
      'Status Pagamento': order.paymentStatus,
      Observações: order.notes || ''
    }));

    console.log('Exportando para PDF:', content);
    
    // Criar um documento temporário para download
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
  };

  const exportToCSV = (period: string) => {
    // Filtrar pedidos baseado no período (simulação)
    const filteredOrders = orders; // Em uma implementação real, filtrar por data
    
    // Cabeçalhos do CSV
    const headers = [
      'ID',
      'Cliente',
      'Telefone',
      'Endereço',
      'Itens',
      'Total',
      'Status',
      'Horário',
      'Pagamento',
      'Status Pagamento',
      'Observações'
    ];

    // Dados dos pedidos
    const rows = filteredOrders.map(order => [
      order.id,
      order.customer,
      order.phone,
      order.address,
      order.items.map(item => `${item.quantity}x ${item.name} - R$ ${item.total.toFixed(2)}`).join('; '),
      `R$ ${order.value.toFixed(2)}`,
      order.status,
      order.time,
      order.paymentMethod,
      order.paymentStatus,
      order.notes || ''
    ]);

    // Criar CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download do arquivo
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_${period}_dias_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    console.log(`Exportando CSV dos últimos ${period} dias`);
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        onClick={exportToPDF}
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Exportar PDF</span>
      </Button>
      <Button
        variant="outline"
        onClick={() => setIsPeriodModalOpen(true)}
        className="flex items-center space-x-2"
      >
        <FileText className="h-4 w-4" />
        <span>Exportar CSV</span>
      </Button>

      <ExportPeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onExport={exportToCSV}
      />
    </div>
  );
};

export default OrderExport;
