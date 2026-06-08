
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import ExportPeriodModal from "./ExportPeriodModal";

interface OrderExportProps {
  /** Triggers a server-side PDF export of all orders. */
  onExportPdf: () => void | Promise<void>;
  /** Triggers a server-side CSV export for the last `period` days. */
  onExportCsv: (period: string) => void | Promise<void>;
}

const OrderExport = ({ onExportPdf, onExportCsv }: OrderExportProps) => {
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        onClick={() => void onExportPdf()}
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
        onExport={onExportCsv}
      />
    </div>
  );
};

export default OrderExport;
