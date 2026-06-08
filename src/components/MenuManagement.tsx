
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useProducts, type Product, type ProductCategory } from "@/hooks/useProducts";

const MenuManagement = () => {
  const { products, loading, createProduct, updateProduct, removeProduct, uploadImage } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    description: "",
    price: "",
    image: "",
    category: "menu" as ProductCategory,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImage(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) return;

    setSubmitting(true);
    try {
      // UI decimal BRL → API integer cents.
      const priceCents = Math.round(parseFloat(formData.price) * 100);
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: priceCents,
        category: formData.category,
        size: formData.size || null,
      };

      let savedId: string | null = null;
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        savedId = updated?.id ?? null;
      } else {
        const created = await createProduct({ ...payload, is_available: true });
        savedId = created?.id ?? null;
      }

      if (savedId && pendingImage) {
        await uploadImage(savedId, pendingImage);
      }

      if (savedId) {
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", size: "", description: "", price: "", image: "", category: "menu" });
    setEditingProduct(null);
    setPendingImage(null);
    setIsAddModalOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setPendingImage(null);
    setFormData({
      name: product.name,
      size: product.size ?? "",
      description: product.description ?? "",
      // API integer cents → UI decimal BRL.
      price: (product.price / 100).toString(),
      image: product.image_url ?? "",
      category: (product.category as ProductCategory) ?? "menu",
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    void removeProduct(productId);
  };

  const handleToggleAvailability = (product: Product) => {
    void updateProduct(product.id, { is_available: !product.is_available });
  };

  const getProductsByCategory = (category: ProductCategory) => {
    return products.filter(product => product.category === category);
  };

  const ProductGrid = ({ categoryProducts }: { categoryProducts: Product[] }) => {
    if (categoryProducts.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          Nenhum produto cadastrado nesta categoria.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 space-y-4">
            <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                {product.size && (
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{product.size}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-orange-600">
                  {/* API integer cents → reais for display. */}
                  {formatCurrency(product.price / 100)}
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
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">
                  {product.is_available ? "Disponível" : "Indisponível"}
                </span>
                <Switch
                  checked={product.is_available}
                  onCheckedChange={() => handleToggleAvailability(product)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
                    <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-orange-600 hover:bg-orange-700">
                      {submitting
                        ? "Salvando..."
                        : editingProduct
                          ? "Salvar Alterações"
                          : "Adicionar Produto"}
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
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando cardápio...
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagement;
