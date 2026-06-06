
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

interface ExportPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (period: string) => void;
}

const ExportPeriodModal = ({ isOpen, onClose, onExport }: ExportPeriodModalProps) => {
  const periods = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '15', label: 'Últimos 15 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '60', label: 'Últimos 60 dias' }
  ];

  const handleExport = (period: string) => {
    onExport(period);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Selecionar Período para Exportação</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione o período dos pedidos que deseja exportar:
          </p>
          <div className="space-y-3">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport(period.value)}
              >
                <Download className="h-4 w-4 mr-2" />
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPeriodModal;
