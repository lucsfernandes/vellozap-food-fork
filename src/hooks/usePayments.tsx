import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from './useEmployees';

/** Period selector accepted by the backend POST /payments/calculate. */
export type PaymentPeriod = 'current_month' | 'last_month' | 'custom';

export interface PaymentRange {
  from?: string;
  to?: string;
}

/**
 * Payment record as returned by the REST backend (PaymentRecordDTO).
 * `total_amount` is INTEGER CENTS — divide by 100 for display.
 */
export interface PaymentRecord {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  total_days: number | null;
  total_hours: number | null;
  total_amount: number;
  payment_status: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface PaymentFilter {
  status?: string;
  from?: string;
  to?: string;
}

export const usePayments = (filter?: PaymentFilter) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PaymentRecord[]>('/payments', { params: filter });
      setPayments(res.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Erro ao carregar pagamentos',
        description: 'Não foi possível carregar os pagamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
    // Depend on the filter's individual fields so the effect only re-runs on
    // real value changes rather than on every new filter object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.status, filter?.from, filter?.to, toast]);

  useEffect(() => {
    if (user) {
      void fetchPayments();
    } else {
      setLoading(false);
    }
  }, [user, fetchPayments]);

  const calculate = async (period: PaymentPeriod, range?: PaymentRange): Promise<PaymentRecord[] | null> => {
    try {
      const body: { period: PaymentPeriod; from?: string; to?: string } = { period };
      if (period === 'custom') {
        body.from = range?.from;
        body.to = range?.to;
      }
      const res = await apiClient.post<PaymentRecord[]>('/payments/calculate', body);
      setPayments(res.data);
      toast({
        title: 'Cálculos realizados',
        description: 'Pagamentos calculados com sucesso.',
      });
      return res.data;
    } catch (error) {
      console.error('Error calculating payments:', error);
      toast({
        title: 'Erro ao calcular',
        description: 'Não foi possível calcular os pagamentos.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const markPaid = async (id: string): Promise<boolean> => {
    try {
      const res = await apiClient.post<PaymentRecord>(`/payments/${id}/pay`);
      setPayments((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      toast({
        title: 'Pagamento registrado',
        description: 'Pagamento marcado como pago.',
      });
      return true;
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast({
        title: 'Erro ao registrar pagamento',
        description: 'Não foi possível marcar o pagamento como pago.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const exportPayments = async (range: { from: string; to: string }): Promise<boolean> => {
    try {
      const res = await apiClient.post(
        '/payments/export',
        { format: 'csv', from: range.from, to: range.to },
        { responseType: 'blob' },
      );
      const blob = new Blob([res.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pagamentos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar os pagamentos.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    payments,
    loading,
    refetch: fetchPayments,
    calculate,
    markPaid,
    exportPayments,
  };
};
