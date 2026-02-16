"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // تحميل السلة من الـ Local Storage عند فتح الموقع
  useEffect(() => {
    const savedCart = localStorage.getItem("haya_cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  // حفظ السلة تلقائياً عند أي تغيير
  useEffect(() => {
    localStorage.setItem("haya_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, variant) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product_id === product.id && item.variant_id === variant.id,
      );
      if (existingItem) {
        return prev.map((item) =>
          item.product_id === product.id && item.variant_id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...product,
          variant,
          product_id: product.id,
          variant_id: variant.id,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (variantId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.variant_id !== variantId),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
