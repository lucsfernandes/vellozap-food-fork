
import { useState } from 'react';
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

export const useDeliveryCalculator = () => {
  const { toast } = useToast();

  // Simulação de cálculo de distância (substituir por API real em produção)
  const calculateDistance = async (originCep: string, destinationCep: string): Promise<number> => {
    try {
      // Simulação - em produção integrar com:
      // 1. ViaCEP para obter coordenadas dos CEPs
      // 2. Google Maps Distance Matrix API ou similar para distância real
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simula delay da API
      
      // Mock baseado nos CEPs para demonstração
      const origin = parseInt(originCep.replace(/\D/g, '').slice(-3));
      const destination = parseInt(destinationCep.replace(/\D/g, '').slice(-3));
      const mockDistance = Math.abs(origin - destination) / 50;
      
      return Math.round(mockDistance * 100) / 100;
    } catch (error) {
      throw new Error('Erro ao calcular distância entre os CEPs');
    }
  };

  const findZoneForDistance = (distance: number, zones: DeliveryZone[]): DeliveryZone | null => {
    return zones.find(zone => 
      distance >= zone.minDistance && distance <= zone.maxDistance
    ) || null;
  };

  const calculateDeliveryFee = async (
    restaurantCep: string,
    customerCep: string,
    deliveryZones: DeliveryZone[]
  ): Promise<DeliveryCalculationResult> => {
    if (!restaurantCep || !customerCep) {
      throw new Error('CEPs são obrigatórios para o cálculo');
    }

    const distance = await calculateDistance(restaurantCep, customerCep);
    const zone = findZoneForDistance(distance, deliveryZones);
    
    return {
      distance,
      zone,
      deliveryFee: zone ? zone.price : 0,
      canDeliver: zone !== null,
      message: zone 
        ? `Entrega disponível - ${zone.description}` 
        : "Fora da área de entrega"
    };
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
    calculateDistance,
    findZoneForDistance,
    validateCep,
    formatCep
  };
};
