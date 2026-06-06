
import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import Checkout from "@/components/Checkout";
import OrderStatus from "@/components/OrderStatus";

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

const PublicMenu = () => {
  const [currentView, setCurrentView] = useState<"menu" | "checkout" | "status">("menu");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const products: Product[] = [
    {
      id: "1",
      name: "Pizza Margherita",
      description: "Molho de tomate, mussarela, manjericão fresco e azeite",
      price: 35.90,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
      featured: true
    },
    {
      id: "2",
      name: "Pizza Calabresa",
      description: "Molho de tomate, mussarela, calabresa, cebola e orégano",
      price: 38.90,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      featured: true
    },
    {
      id: "3",
      name: "Pizza Portuguesa",
      description: "Molho de tomate, mussarela, presunto, ovos, cebola, azeitona e orégano",
      price: 42.90,
      image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop"
    },
    {
      id: "4",
      name: "Pizza Frango Catupiry",
      description: "Molho de tomate, mussarela, frango desfiado, catupiry e orégano",
      price: 40.90,
      image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop"
    }
  ];

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

  const handlePlaceOrder = (orderData: any) => {
    console.log("Pedido realizado:", orderData);
    const newOrderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderNumber(newOrderNumber);
    setCurrentView("status");
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (currentView === "checkout") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header restaurantName="Pizzaria Bella Vista" showCart={false} />
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
        restaurantName="Pizzaria Bella Vista"
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-green-600 to-green-700">
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Pizzaria Bella Vista</h1>
            <p className="text-xl opacity-90">As melhores pizzas da região, feitas com amor e ingredientes frescos</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Products */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Destaques do Cardápio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(p => p.featured).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>

        {/* All Products */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Cardápio Completo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
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
