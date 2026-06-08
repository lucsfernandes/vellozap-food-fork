
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CalendarIcon, Download, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { useEmployees } from '@/hooks/useEmployees';
import { usePayments, type PaymentPeriod } from '@/hooks/usePayments';

const PaymentControl = () => {
  const { employees } = useEmployees();
  const { payments, calculate, markPaid, exportPayments } = usePayments();

  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod>('current_month');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isCalculating, setIsCalculating] = useState(false);

  // Only employees with a configured payment type can be paid.
  const payableEmployees = employees.filter((e) => e.payment_type);

  const getPeriodDates = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (selectedPeriod) {
      case 'current_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month': {
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      case 'custom':
        if (!customStartDate || !customEndDate) return { startDate: null, endDate: null };
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return { startDate, endDate };
  };

  const calculatePayments = async () => {
    const { startDate, endDate } = getPeriodDates();
    if (!startDate || !endDate) return;

    setIsCalculating(true);
    await calculate(
      selectedPeriod,
      selectedPeriod === 'custom'
        ? { from: format(startDate, 'yyyy-MM-dd'), to: format(endDate, 'yyyy-MM-dd') }
        : undefined,
    );
    setIsCalculating(false);
  };

  const markAsPaid = (paymentId: string) => {
    void markPaid(paymentId);
  };

  const exportToCSV = () => {
    const { startDate, endDate } = getPeriodDates();
    if (!startDate || !endDate) return;
    void exportPayments({
      from: format(startDate, 'yyyy-MM-dd'),
      to: format(endDate, 'yyyy-MM-dd'),
    });
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      auxiliar_cozinha: "Auxiliar de Cozinha",
      atendente: "Atendente",
      cozinheiro: "Cozinheiro",
      chef: "Chef",
      pizzaiolo: "Pizzaiolo",
      motoboy: "Motoboy"
    };
    return roleMap[role] || role;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-orange-600" />
            <span>Controle de Pagamentos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mês Atual</SelectItem>
                <SelectItem value="last_month">Mês Passado</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {payments.length > 0 && (
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPeriod === 'custom' && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, 'dd/MM/yyyy') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, 'dd/MM/yyyy') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {payableEmployees.length} funcionário(s) cadastrado(s) com informações de pagamento
          </p>
          <Button 
            onClick={calculatePayments} 
            disabled={isCalculating}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Clock className="h-4 w-4 mr-2" />
            {isCalculating ? 'Calculando...' : 'Calcular Pagamentos'}
          </Button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum pagamento calculado</h3>
            <p className="text-muted-foreground mb-4">
              Clique em "Calcular Pagamentos" para gerar os valores do período selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{payment.employee?.name ?? 'Funcionário'}</h3>
                      {payment.employee?.role && (
                        <Badge variant="outline">
                          {getRoleLabel(payment.employee.role)}
                        </Badge>
                      )}
                      <Badge className={payment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {payment.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 Período: {format(new Date(payment.period_start), 'dd/MM/yyyy')} - {format(new Date(payment.period_end), 'dd/MM/yyyy')}</p>
                      {payment.total_days != null && payment.total_days > 0 && <p>📊 Dias trabalhados: {payment.total_days}</p>}
                      {payment.total_hours != null && payment.total_hours > 0 && <p>⏰ Horas trabalhadas: {payment.total_hours}</p>}
                      <p>💰 <strong>Total: {formatCurrency(payment.total_amount / 100)}</strong></p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {payment.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => markAsPaid(payment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Pago
                      </Button>
                    )}
                    {payment.payment_status === 'paid' && payment.payment_date && (
                      <p className="text-xs text-green-600">
                        Pago em {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentControl;
