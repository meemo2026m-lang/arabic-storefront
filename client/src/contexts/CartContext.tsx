import { addCartLine, cartCount, cartTotal, removeCartLine, type CartLine, type CartProduct, updateCartLine } from "@/lib/cart";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "matjari-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return;
    try {
      setLines(JSON.parse(saved) as CartLine[]);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    count: cartCount(lines),
    total: cartTotal(lines),
    isOpen,
    addItem: (product, quantity = 1) => {
      setLines(current => addCartLine(current, product, quantity));
      setIsOpen(true);
    },
    updateQuantity: (productId, quantity) => setLines(current => updateCartLine(current, productId, quantity)),
    removeItem: productId => setLines(current => removeCartLine(current, productId)),
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }), [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
