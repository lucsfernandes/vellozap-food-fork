import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Delivery zone as exposed to the UI. `price` is in BRL reais here; the
 * backend stores/returns integer cents, so this hook converts at the boundary
 * (divide by 100 on read, `Math.round(x * 100)` on write).
 */
export interface DeliveryZone {
  id: string;
  minDistance: number;
  maxDistance: number;
  price: number;
  description: string;
}

/** Raw backend shape: `price` is integer cents. */
interface DeliveryZoneApi {
  id: string;
  minDistance: number;
  maxDistance: number;
  price: number;
  description: string;
}

export interface DeliveryCalculationResult {
  distance: number;
  zone: DeliveryZone | null;
  deliveryFee: number; // reais
  canDeliver: boolean;
  message: string;
}

/** Raw backend calculation result: money fields are integer cents. */
interface DeliveryCalculationApi {
  distance: number;
  zone: DeliveryZoneApi | null;
  deliveryFee: number;
  canDeliver: boolean;
  message: string;
}

const zoneFromApi = (z: DeliveryZoneApi): DeliveryZone => ({
  ...z,
  price: z.price / 100,
});

export const useDeliveryZones = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<DeliveryZoneApi[]>('/delivery/zones');
      setZones(res.data.map(zoneFromApi));
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      toast({
        title: 'Erro ao carregar faixas de entrega',
        description: 'Não foi possível carregar as faixas de entrega.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      void fetchZones();
    } else {
      setLoading(false);
    }
  }, [user, fetchZones]);

  /** Replace/upsert all zones at once (PUT). `price` is given in reais. */
  const saveZones = async (next: DeliveryZone[]): Promise<boolean> => {
    try {
      const body = next.map((z) => ({
        minDistance: z.minDistance,
        maxDistance: z.maxDistance,
        price: Math.round(z.price * 100),
        description: z.description,
      }));
      const res = await apiClient.put<DeliveryZoneApi[]>('/delivery/zones', body);
      setZones(res.data.map(zoneFromApi));
      toast({
        title: 'Faixas salvas',
        description: 'As faixas de entrega foram salvas com sucesso.',
      });
      return true;
    } catch (error) {
      console.error('Error saving delivery zones:', error);
      toast({
        title: 'Erro ao salvar faixas',
        description: 'Não foi possível salvar as faixas de entrega.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const calculate = async (params: {
    originCep?: string;
    customerCep: string;
  }): Promise<DeliveryCalculationResult | null> => {
    try {
      const body: Record<string, unknown> = { customerCep: params.customerCep };
      if (params.originCep) body.originCep = params.originCep;
      const res = await apiClient.post<DeliveryCalculationApi>('/delivery/calculate', body);
      const data = res.data;
      return {
        distance: data.distance,
        zone: data.zone ? zoneFromApi(data.zone) : null,
        deliveryFee: data.deliveryFee / 100,
        canDeliver: data.canDeliver,
        message: data.message,
      };
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      toast({
        title: 'Erro no cálculo',
        description: 'Não foi possível calcular a distância. Verifique os CEPs informados.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    zones,
    loading,
    saveZones,
    calculate,
    refetch: fetchZones,
  };
};
