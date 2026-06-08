import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Operating-hours schedule for a single day. `day_of_week` is 0=Monday..6=Sunday
 * per the backend contract.
 */
export interface OperatingHour {
  id: string;
  restaurant_id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

/** Body row accepted by PUT /operating-hours. */
export interface OperatingHourInput {
  day_of_week: number;
  is_open: boolean;
  open_time?: string | null;
  close_time?: string | null;
}

export const useOperatingHours = () => {
  const [hours, setHours] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHours = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<OperatingHour[]>('/operating-hours');
      setHours(res.data);
    } catch (error) {
      console.error('Error fetching operating hours:', error);
      toast({
        title: 'Erro ao carregar horários',
        description: 'Não foi possível carregar os horários de funcionamento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      void fetchHours();
    } else {
      setLoading(false);
    }
  }, [user, fetchHours]);

  /** Replace/upsert the whole weekly schedule at once (PUT). */
  const saveHours = async (schedule: OperatingHourInput[]): Promise<boolean> => {
    try {
      const res = await apiClient.put<OperatingHour[]>('/operating-hours', schedule);
      setHours(res.data);
      toast({
        title: 'Horários salvos',
        description: 'Os horários de funcionamento foram salvos com sucesso.',
      });
      return true;
    } catch (error) {
      console.error('Error saving operating hours:', error);
      toast({
        title: 'Erro ao salvar horários',
        description: 'Não foi possível salvar os horários de funcionamento.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    hours,
    loading,
    saveHours,
    refetch: fetchHours,
  };
};
