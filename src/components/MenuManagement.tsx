
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface Product {
  id: string;
  name: string;
  size: string;
  description: string;
  price: number;
  image: string;
  category: 'menu' | 'bebidas' | 'sobremesas';
}

const MenuManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    description: "",
    price: "",
    image: "",
    category: "menu" as 'menu' | 'bebidas' | 'sobremesas'
  });

  // Produtos de exemplo por categoria
  const [products, setProducts] = useState<Product[]>([
    // Menu (Pizzas)
    {
      id: "1",
      name: "Pizza Margherita",
      size: "G",
      description: "Molho de tomate, mussarela, manjericão fresco",
      price: 35.90,
      image: "/placeholder.svg",
      category: "menu"
    },
    {
      id: "2",
      name: "Pizza Calabresa",
      size: "M",
      description: "Molho de tomate, mussarela, calabresa, cebola",
      price: 32.90,
      image: "/placeholder.svg",
      category: "menu"
    },
    {
      id: "3",
      name: "Pizza Portuguesa",
      size: "G",
      description: "Molho de tomate, mussarela, presunto, ovos, cebola, azeitona",
      price: 42.90,
      image: "/placeholder.svg",
      category: "menu"
    },
    // Bebidas
    {
      id: "4",
      name: "Coca-Cola",
      size: "350ml",
      description: "Refrigerante gelado",
      price: 5.50,
      image: "/placeholder.svg",
      category: "bebidas"
    },
    {
      id: "5",
      name: "Suco de Laranja",
      size: "300ml",
      description: "Suco natural de laranja",
      price: 7.90,
      image: "/placeholder.svg",
      category: "bebidas"
    },
    // Sobremesas
    {
      id: "6",
      name: "Pudim de Leite",
      size: "Fatia",
      description: "Pudim de leite condensado com calda de caramelo",
      price: 8.50,
      image: "/placeholder.svg",
      category: "sobremesas"
    },
    {
      id: "7",
      name: "Brownie",
      size: "Unidade",
      description: "Brownie de chocolate com nozes",
      price: 12.90,
      image: "/placeholder.svg",
      category: "sobremesas"
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) return;

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name,
      size: formData.size,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || "/placeholder.svg",
      category: formData.category
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts(prev => [...prev, newProduct]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", size: "", description: "", price: "", image: "", category: "menu" });
    setEditingProduct(null);
    setIsAddModalOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      size: product.size,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const getProductsByCategory = (category: 'menu' | 'bebidas' | 'sobremesas') => {
    return products.filter(product => product.category === category);
  };

  const ProductGrid = ({ categoryProducts }: { categoryProducts: Product[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoryProducts.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 space-y-4">
          <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">{product.size}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(product.price)}
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gerenciar Cardápio
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Produto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Pizza Margherita"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menu">Menu (Pratos Principais)</SelectItem>
                        <SelectItem value="bebidas">Bebidas</SelectItem>
                        <SelectItem value="sobremesas">Sobremesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="size">Tamanho</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => handleInputChange("size", e.target.value)}
                      placeholder="Ex: G, 350ml, Fatia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Ingredientes e características do produto"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Valor (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Foto do Produto</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSubmit} className="flex-1 bg-orange-600 hover:bg-orange-700">
                      {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="bebidas">Bebidas</TabsTrigger>
              <TabsTrigger value="sobremesas">Sobremesas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="mt-6">
              <ProductGrid categoryProducts={getProductsByCategory('menu')} />
            </TabsContent>
            
            <TabsContent value="bebidas" className="mt-6">
              <ProductGrid categoryProducts={getProductsByCategory('bebidas')} />
            </TabsContent>
            
            <TabsContent value="sobremesas" className="mt-6">
              <ProductGrid categoryProducts={getProductsByCategory('sobremesas')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagement;
