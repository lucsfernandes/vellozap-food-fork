import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export type ProductCategory = 'menu' | 'bebidas' | 'sobremesas';

/** Mirrors the backend ProductDTO. `price` is integer BRL cents. */
export interface Product {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number | null;
  category: string | null;
  size: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for create/update. `price` is integer BRL cents. */
export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  stock_quantity?: number | null;
  category?: ProductCategory | null;
  size?: string | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiClient.get<Product[]>('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: 'Não foi possível carregar o cardápio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      void fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user, fetchProducts]);

  const createProduct = async (input: ProductInput): Promise<Product | null> => {
    try {
      const res = await apiClient.post<Product>('/products', input);
      setProducts((prev) => [...prev, res.data]);
      toast({
        title: 'Produto adicionado',
        description: 'O produto foi adicionado ao cardápio.',
      });
      return res.data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar o produto.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductInput>): Promise<Product | null> => {
    try {
      const res = await apiClient.patch<Product>(`/products/${id}`, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      toast({
        title: 'Produto atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
      return res.data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o produto.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const removeProduct = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: 'Produto removido',
        description: 'O produto foi removido do cardápio.',
      });
      return true;
    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o produto.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const uploadImage = async (id: string, file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiClient.post<{ image_url: string }>(`/products/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = res.data.image_url;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, image_url: imageUrl } : p)));
      return imageUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      toast({
        title: 'Erro ao enviar imagem',
        description: 'Não foi possível enviar a imagem do produto.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    removeProduct,
    uploadImage,
    refetch: fetchProducts,
  };
};
