
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import Checkout from "@/components/Checkout";
import OrderStatus from "@/components/OrderStatus";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  featured?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

/** Customer data collected by the Checkout form. */
interface CheckoutData {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  number: string;
  complement: string;
  reference: string;
  paymentMethod: string;
}

/** Raw product shape returned by the public menu endpoint (price in cents). */
interface PublicMenuProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface PublicMenuResponse {
  restaurant: {
    id: string;
    name: string;
    logo_url: string | null;
    delivery_type: string | null;
    whatsapp_number: string | null;
  };
  products: PublicMenuProduct[];
}

const DEFAULT_RESTAURANT_NAME = "Cardápio";

const PublicMenu = () => {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("r") ?? searchParams.get("restaurant");
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<"menu" | "checkout" | "status">("menu");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [restaurantName, setRestaurantName] = useState(DEFAULT_RESTAURANT_NAME);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let active = true;
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<PublicMenuResponse>(
          `/public/restaurants/${restaurantId}/menu`,
        );
        if (!active) return;
        setRestaurantName(res.data.restaurant.name);
        setProducts(
          res.data.products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            // API integer cents → reais for display.
            price: product.price / 100,
            image: product.image_url || "/placeholder.svg",
          })),
        );
        setNotFound(false);
      } catch (error) {
        if (!active) return;
        console.error("Error loading public menu:", error);
        setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchMenu();
    return () => {
      active = false;
    };
  }, [restaurantId]);

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(items =>
        items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(items => [...items, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setCurrentView("checkout");
    setIsCartOpen(false);
  };

  const handlePlaceOrder = async (orderData: CheckoutData) => {
    if (!restaurantId) return;
    try {
      const res = await apiClient.post<{ orderId: string; status: string; total_amount: number }>(
        `/public/restaurants/${restaurantId}/orders`,
        {
          customer: {
            name: orderData.name,
            phone: orderData.phone,
            address: orderData.address,
            neighborhood: orderData.neighborhood,
            number: orderData.number,
            complement: orderData.complement,
            reference: orderData.reference,
          },
          items: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
          payment_method: orderData.paymentMethod,
        },
      );
      setOrderNumber(res.data.orderId);
      setCurrentView("status");
      setCartItems([]);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Não foi possível finalizar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando cardápio...
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Restaurante não encontrado</h1>
          <p className="text-gray-600">
            Não foi possível carregar este cardápio. Verifique o link e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (currentView === "checkout") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header restaurantName={restaurantName} showCart={false} />
        <Checkout
          total={cartTotal}
          onPlaceOrder={handlePlaceOrder}
          onBack={() => setCurrentView("menu")}
        />
      </div>
    );
  }

  if (currentView === "status") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <OrderStatus
          orderNumber={orderNumber}
          status="received"
          onNewOrder={() => setCurrentView("menu")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        restaurantName={restaurantName}
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-green-600 to-green-700">
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{restaurantName}</h1>
            <p className="text-xl opacity-90">Confira nosso cardápio e faça seu pedido</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* All Products */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Cardápio Completo</h2>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              Nenhum produto disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Cart
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default PublicMenu;
