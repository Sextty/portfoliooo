import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem } from "./types";

interface StoreContextType {
  cart: CartItem[];
  wishlist: number[];
  cartCount: number;
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  wishlistCount: number;
}

const StoreContext = createContext<StoreContextType>({} as StoreContextType);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Load from localStorage on mount (no DB dependency)
  useEffect(() => {
    const savedCart = localStorage.getItem("gb_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // New format: full CartItem[] with products embedded
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].product) {
          setCart(parsed);
        }
      } catch {}
    }
    const savedWishlist = localStorage.getItem("gb_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {}
    }
  }, []);

  // Sync cart to localStorage (full product data)
  useEffect(() => {
    localStorage.setItem("gb_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("gb_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isWishlisted = (productId: number) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
