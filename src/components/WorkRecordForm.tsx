
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

interface Employee {
  id: string;
  name: string;
  payment_type: string;
}

interface WorkRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave: () => void;
}

const WorkRecordForm = ({ isOpen, onClose, employee, onSave }: WorkRecordFormProps) => {
  const [workDate, setWorkDate] = useState<Date>(new Date());
  const [hoursWorked, setHoursWorked] = useState('');
  const [daysWorked, setDaysWorked] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!workDate) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione a data do trabalho.",
        variant: "destructive",
      });
      return;
    }

    if (employee.payment_type === 'hourly' && !hoursWorked) {
      toast({
        title: "Campo obrigatório",
        description: "Informe as horas trabalhadas.",
        variant: "destructive",
      });
      return;
    }

    if (employee.payment_type === 'daily' && !daysWorked) {
      toast({
        title: "Campo obrigatório",
        description: "Informe os dias trabalhados.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/employees/${employee.id}/work-records`, {
        work_date: format(workDate, 'yyyy-MM-dd'),
        hours_worked: employee.payment_type === 'hourly' ? parseFloat(hoursWorked) : null,
        days_worked: employee.payment_type === 'daily' ? parseInt(daysWorked) : null,
      });

      toast({
        title: "Registro salvo",
        description: "Trabalho registrado com sucesso.",
      });

      setHoursWorked('');
      setDaysWorked('');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving work record:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o registro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Trabalho - {employee.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data do Trabalho</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {workDate ? format(workDate, 'dd/MM/yyyy') : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={workDate}
                  onSelect={(date) => date && setWorkDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {employee.payment_type === 'hourly' && (
            <div className="space-y-2">
              <Label htmlFor="hours">Horas Trabalhadas</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                placeholder="Ex: 8.5"
              />
            </div>
          )}

          {employee.payment_type === 'daily' && (
            <div className="space-y-2">
              <Label htmlFor="days">Dias Trabalhados</Label>
              <Input
                id="days"
                type="number"
                value={daysWorked}
                onChange={(e) => setDaysWorked(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
          )}

          {employee.payment_type === 'monthly' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Este funcionário recebe salário fixo mensal. O cálculo será feito automaticamente no final do mês.
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkRecordForm;
