import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Employee as returned by the REST backend (EmployeeDTO).
 * Money fields (`payment_value`) are INTEGER CENTS — divide by 100 for display.
 */
export interface Employee {
  id: string;
  restaurant_id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  payment_type: string | null;
  payment_value: number | null;
  pix_key: string | null;
  bank_name: string | null;
  agency: string | null;
  account: string | null;
  created_at: string;
}

/** Payload for creating/updating an employee. `payment_value` is integer cents. */
export interface EmployeeInput {
  name: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  payment_type?: string | null;
  payment_value?: number | null;
  pix_key?: string | null;
  bank_name?: string | null;
  agency?: string | null;
  account?: string | null;
}

/** Work record as returned by the REST backend (WorkRecordDTO). */
export interface WorkRecord {
  id: string;
  employee_id: string;
  work_date: string;
  hours_worked: number | null;
  days_worked: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkRecordInput {
  work_date: string;
  hours_worked?: number | null;
  days_worked?: number | null;
}

export interface WorkRecordRange {
  from?: string;
  to?: string;
}

export const useEmployees = (role?: string) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Employee[]>('/employees', {
        params: role && role !== 'all' ? { role } : undefined,
      });
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Erro ao carregar equipe',
        description: 'Não foi possível carregar a lista de funcionários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [role, toast]);

  useEffect(() => {
    if (user) {
      void fetchEmployees();
    } else {
      setLoading(false);
    }
  }, [user, fetchEmployees]);

  const createEmployee = async (input: EmployeeInput): Promise<Employee | null> => {
    try {
      const res = await apiClient.post<Employee>('/employees', input);
      await fetchEmployees();
      return res.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar o funcionário.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateEmployee = async (id: string, input: Partial<EmployeeInput>): Promise<Employee | null> => {
    try {
      const res = await apiClient.patch<Employee>(`/employees/${id}`, input);
      await fetchEmployees();
      return res.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o funcionário.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const removeEmployee = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/employees/${id}`);
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error('Error removing employee:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o funcionário.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const listWorkRecords = async (employeeId: string, range?: WorkRecordRange): Promise<WorkRecord[]> => {
    try {
      const res = await apiClient.get<WorkRecord[]>(`/employees/${employeeId}/work-records`, {
        params: range,
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching work records:', error);
      toast({
        title: 'Erro ao carregar registros',
        description: 'Não foi possível carregar os registros de trabalho.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const createWorkRecord = async (
    employeeId: string,
    input: WorkRecordInput,
  ): Promise<WorkRecord | null> => {
    try {
      const res = await apiClient.post<WorkRecord>(`/employees/${employeeId}/work-records`, input);
      return res.data;
    } catch (error) {
      console.error('Error creating work record:', error);
      toast({
        title: 'Erro ao registrar',
        description: 'Não foi possível salvar o registro de trabalho.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteWorkRecord = async (employeeId: string, recordId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/employees/${employeeId}/work-records/${recordId}`);
      return true;
    } catch (error) {
      console.error('Error deleting work record:', error);
      toast({
        title: 'Erro ao remover registro',
        description: 'Não foi possível remover o registro de trabalho.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    employees,
    loading,
    refetch: fetchEmployees,
    createEmployee,
    updateEmployee,
    removeEmployee,
    listWorkRecords,
    createWorkRecord,
    deleteWorkRecord,
  };
};
