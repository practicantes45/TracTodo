"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "tractodo_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.warn("No se pudo cargar el carrito", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("No se pudo persistir el carrito", error);
    }
  }, [items]);

  const addItem = (item) => {
    if (!item?.id) {
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((existing) => existing.id === item.id);
      if (existingIndex !== -1) {
        const next = [...prev];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          quantity: existing.quantity + (item.quantity || 1),
        };
        return next;
      }

      return [
        ...prev,
        {
          id: item.id,
          name: item.name || "Producto",
          price: Number(item.price) || 0,
          quantity: item.quantity || 1,
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: safeQuantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total: totals.total,
      itemCount: totals.itemCount,
    }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};
