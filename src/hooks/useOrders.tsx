import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type StatsPeriod = 'hoje' | 'semana' | 'mes';

/** Order summary as returned by `GET /orders` (money fields are integer cents). */
export interface Order {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Order item as returned inside `GET /orders/:id` (money fields are integer cents). */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  /** Resolved client-side from `GET /products` (the order DTO carries only product_id). */
  product_name?: string;
}

/** Detailed order as returned by `GET /orders/:id`. */
export interface OrderDetailed extends Order {
  items: OrderItem[];
}

/** Stats as returned by `GET /orders/stats` (totalRevenue / avgOrderValue are integer cents). */
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface ListOrdersResponse {
  data: Order[];
  total: number;
}

export interface ExportRange {
  period?: number;
  from?: string;
  to?: string;
}

export const useOrders = (period: StatsPeriod = 'mes') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        apiClient.get<ListOrdersResponse>('/orders'),
        apiClient.get<OrderStats>('/orders/stats', { params: { period } }),
      ]);
      setOrders(listRes.data.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Erro ao carregar pedidos',
        description: 'Não foi possível carregar os pedidos do restaurante.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  useEffect(() => {
    if (user) {
      void fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, fetchOrders]);

  const getOrder = useCallback(async (id: string): Promise<OrderDetailed | null> => {
    try {
      // The order DTO carries only product_id per item, so resolve the names
      // from the products catalog and enrich the items for display.
      const [orderRes, productsRes] = await Promise.all([
        apiClient.get<OrderDetailed>(`/orders/${id}`),
        apiClient.get<Array<{ id: string; name: string }>>('/products'),
      ]);
      const nameById = new Map(productsRes.data.map((p) => [p.id, p.name]));
      const order = orderRes.data;
      return {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          product_name: nameById.get(item.product_id) ?? 'Produto',
        })),
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: 'Erro ao carregar pedido',
        description: 'Não foi possível carregar os detalhes do pedido.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus): Promise<boolean> => {
    try {
      const res = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? res.data : o)));
      toast({
        title: 'Status atualizado',
        description: 'O status do pedido foi atualizado com sucesso.',
      });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const exportOrders = useCallback(
    async (format: 'csv' | 'pdf', range?: ExportRange): Promise<void> => {
      try {
        const res = await apiClient.post(
          '/orders/export',
          { format, ...range },
          { responseType: 'blob' },
        );
        const blob = res.data as Blob;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pedidos_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting orders:', error);
        toast({
          title: 'Erro ao exportar',
          description: 'Não foi possível exportar os pedidos.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  return {
    orders,
    stats,
    loading,
    refetch: fetchOrders,
    getOrder,
    updateStatus,
    exportOrders,
  };
};
