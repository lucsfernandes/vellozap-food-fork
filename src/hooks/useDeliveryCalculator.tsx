import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export interface DeliveryZone {
  id: string;
  minDistance: number;
  maxDistance: number;
  price: number;
  description: string;
}

export interface DeliveryCalculationResult {
  distance: number;
  zone: DeliveryZone | null;
  deliveryFee: number;
  canDeliver: boolean;
  message: string;
}

/** Raw backend shapes: money fields are integer cents. */
interface DeliveryZoneApi {
  id: string;
  minDistance: number;
  maxDistance: number;
  price: number;
  description: string;
}

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

export const useDeliveryCalculator = () => {
  const { toast } = useToast();

  const findZoneForDistance = (distance: number, zones: DeliveryZone[]): DeliveryZone | null => {
    return zones.find((zone) => distance >= zone.minDistance && distance <= zone.maxDistance) || null;
  };

  /**
   * Calculates the delivery fee via the backend `/delivery/calculate` endpoint.
   * Distance and the matching zone are resolved server-side from the owner's
   * configured zones; the `deliveryZones` arg is no longer used for the
   * computation but is kept in the signature for backward compatibility.
   */
  const calculateDeliveryFee = async (
    restaurantCep: string,
    customerCep: string,
    _deliveryZones?: DeliveryZone[],
  ): Promise<DeliveryCalculationResult> => {
    if (!customerCep) {
      throw new Error('CEPs são obrigatórios para o cálculo');
    }

    try {
      const body: Record<string, unknown> = { customerCep };
      if (restaurantCep) body.originCep = restaurantCep;
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
      toast({
        title: 'Erro no cálculo',
        description: 'Não foi possível calcular a distância entre os CEPs.',
        variant: 'destructive',
      });
      throw new Error('Erro ao calcular distância entre os CEPs');
    }
  };

  // Função para validar CEP brasileiro
  const validateCep = (cep: string): boolean => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  };

  // Função para formatar CEP
  const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return {
    calculateDeliveryFee,
    findZoneForDistance,
    validateCep,
    formatCep,
  };
};
