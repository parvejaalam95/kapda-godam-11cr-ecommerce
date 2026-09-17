import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CartLine, Product } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  totalPieces: number;
  totalEstimate: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kapda-godam-cart") ?? "[]") as CartLine[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("kapda-godam-cart", JSON.stringify(lines));
  }, [lines]);

  const value = useMemo(() => ({
    lines,
    totalPieces: lines.reduce((total, line) => total + line.quantity, 0),
    totalEstimate: lines.reduce((total, line) => total + line.quantity * line.product.price, 0),
    addItem: (product: Product, quantity = product.moq) => {
      setLines((current) => {
        const found = current.find((line) => line.product.id === product.id);
        if (found) return current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(product.stock, line.quantity + quantity) } : line);
        return [...current, { product, quantity: Math.min(product.stock, Math.max(product.moq, quantity)) }];
      });
      toast.success("Added to wholesale cart", { description: `${product.name} · MOQ ${product.moq} pieces` });
    },
    updateQuantity: (productId: string, quantity: number) => setLines((current) => current.map((line) => line.product.id === productId ? { ...line, quantity: Math.min(line.product.stock, Math.max(1, quantity)) } : line)),
    removeItem: (productId: string) => setLines((current) => current.filter((line) => line.product.id !== productId)),
    clearCart: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
