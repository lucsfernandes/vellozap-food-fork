
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { Plus, Trash2, Package, DollarSign } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: string;
}

interface ProductsStepProps {
  onValidChange: (isValid: boolean) => void;
}

const ProductsStep = ({ onValidChange }: ProductsStepProps) => {
  const [products, setProducts] = useState<Product[]>([
    { name: '', description: '', price: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { profile } = useRestaurantProfile();
  const { toast } = useToast();

  useEffect(() => {
    loadExistingProducts();
  }, [profile]);

  useEffect(() => {
    const hasValidProduct = products.some(product => 
      product.name.trim() !== '' && 
      product.price.trim() !== '' &&
      !isNaN(parseFloat(product.price))
    );
    onValidChange(hasValidProduct);
  }, [products, onValidChange]);

  const loadExistingProducts = async () => {
    if (!profile?.id) return;

    try {
      const { data } = await apiClient.get<Array<{
        id: string;
        name: string;
        description: string | null;
        price: number;
      }>>('/products', { params: { limit: 5 } });

      if (data && data.length > 0) {
        setProducts(data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          // API returns integer cents; UI works in decimal BRL.
          price: (product.price / 100).toString()
        })));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addProduct = () => {
    setProducts([...products, { name: '', description: '', price: '' }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const saveProducts = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const validProducts = products.filter(product => 
        product.name.trim() !== '' && 
        product.price.trim() !== '' &&
        !isNaN(parseFloat(product.price))
      );

      for (const product of validProducts) {
        // UI decimal BRL → API integer cents.
        const priceCents = Math.round(parseFloat(product.price) * 100);
        if (product.id) {
          await apiClient.patch(`/products/${product.id}`, {
            name: product.name,
            description: product.description,
            price: priceCents,
          });
        } else {
          await apiClient.post('/products', {
            name: product.name,
            description: product.description,
            price: priceCents,
            is_available: true,
          });
        }
      }

      toast({
        title: "Produtos salvos!",
        description: "Seus produtos foram adicionados ao cardápio.",
      });
    } catch (error) {
      console.error('Error saving products:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-orange-600" />
            <span>Cadastro de Produtos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Adicione pelo menos um produto ao seu cardápio. Você pode adicionar mais produtos depois.
          </p>
          
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Produto {index + 1}</h4>
                  {products.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Produto *</Label>
                    <Input
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      placeholder="Ex: Pizza Margherita"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preço *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProduct(index, 'price', e.target.value)}
                        placeholder="0,00"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    placeholder="Descreva os ingredientes e características do produto..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={addProduct}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Produto</span>
            </Button>
            
            <Button
              onClick={saveProducts}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Salvando...' : 'Salvar Produtos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para um bom cardápio:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use nomes atrativos e descritivos para seus produtos</li>
          <li>• Inclua os principais ingredientes na descrição</li>
          <li>• Defina preços competitivos para sua região</li>
          <li>• Você pode adicionar fotos dos produtos mais tarde</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductsStep;
