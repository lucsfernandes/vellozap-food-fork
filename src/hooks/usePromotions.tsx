import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Promotion as exposed to the UI. Money (`discount`) is in BRL reais here;
 * the backend stores/returns integer cents, so this hook converts at the
 * boundary (divide by 100 on read, `Math.round(x * 100)` on write).
 */
export interface Promotion {
  id: string;
  restaurant_id: string;
  name: string;
  type: string;
  discount: number;
  product_ids: string[] | null;
  valid_from: string | null;
  valid_to: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Raw backend shape: `discount` is integer cents. */
interface PromotionApi extends Omit<Promotion, 'discount'> {
  discount: number;
}

export interface PromotionInput {
  name: string;
  type: string;
  discount?: number; // reais
  products?: string[] | null;
  validFrom?: string | null;
  validTo?: string | null;
  active?: boolean;
}

const fromApi = (p: PromotionApi): Promotion => ({
  ...p,
  discount: p.discount / 100,
});

const toApiBody = (input: Partial<PromotionInput>): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.type !== undefined) body.type = input.type;
  if (input.discount !== undefined) body.discount = Math.round(input.discount * 100);
  if (input.products !== undefined) body.products = input.products;
  if (input.validFrom !== undefined) body.validFrom = input.validFrom;
  if (input.validTo !== undefined) body.validTo = input.validTo;
  if (input.active !== undefined) body.active = input.active;
  return body;
};

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<PromotionApi[]>('/promotions');
      setPromotions(res.data.map(fromApi));
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: 'Erro ao carregar promoções',
        description: 'Não foi possível carregar as promoções.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      void fetchPromotions();
    } else {
      setLoading(false);
    }
  }, [user, fetchPromotions]);

  const createPromotion = async (input: PromotionInput): Promise<Promotion | null> => {
    try {
      const res = await apiClient.post<PromotionApi>('/promotions', toApiBody(input));
      const created = fromApi(res.data);
      setPromotions((prev) => [...prev, created]);
      toast({
        title: 'Promoção criada',
        description: 'A promoção foi criada com sucesso.',
      });
      return created;
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: 'Erro ao criar promoção',
        description: 'Não foi possível criar a promoção.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePromotion = async (
    id: string,
    input: Partial<PromotionInput>,
  ): Promise<Promotion | null> => {
    try {
      const res = await apiClient.patch<PromotionApi>(`/promotions/${id}`, toApiBody(input));
      const updated = fromApi(res.data);
      setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast({
        title: 'Promoção atualizada',
        description: 'As alterações foram salvas com sucesso.',
      });
      return updated;
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: 'Erro ao atualizar promoção',
        description: 'Não foi possível atualizar a promoção.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const removePromotion = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/promotions/${id}`);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: 'Promoção removida',
        description: 'A promoção foi removida com sucesso.',
      });
      return true;
    } catch (error) {
      console.error('Error removing promotion:', error);
      toast({
        title: 'Erro ao remover promoção',
        description: 'Não foi possível remover a promoção.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    promotions,
    loading,
    createPromotion,
    updatePromotion,
    removePromotion,
    refetch: fetchPromotions,
  };
};
