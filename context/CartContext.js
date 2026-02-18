"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. تحميل السلة من الـ Local Storage مرة واحدة فقط عند البداية
  useEffect(() => {
    const savedCart = localStorage.getItem("haya_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
    setIsInitialized(true); // نؤكد أننا انتهينا من التحميل
  }, []);

  // 2. حفظ السلة فقط بعد أن نكون قد تأكدنا من تحميل البيانات القديمة
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("haya_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // دالة الإضافة (تم تعديلها لتستقبل كائن واحد شامل)
  const addToCart = (itemToAdd) => {
    setCartItems((prev) => {
      // البحث باستخدام المعرف الفريد (اللون والمقاس والمنتج)
      const existingItem = prev.find(
        (item) =>
          item.id === itemToAdd.id &&
          item.size === itemToAdd.size &&
          item.color === itemToAdd.color,
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === itemToAdd.id &&
          item.size === itemToAdd.size &&
          item.color === itemToAdd.color
            ? { ...item, quantity: item.quantity + (itemToAdd.quantity || 1) }
            : item,
        );
      }

      return [...prev, { ...itemToAdd, quantity: itemToAdd.quantity || 1 }];
    });
  };

  const removeFromCart = (uniqueKey) => {
    //uniqueKey هنا هو مزيج من id-size-color لضمان الدقة
    setCartItems((prev) =>
      prev.filter(
        (item) => `${item.id}-${item.size}-${item.color}` !== uniqueKey,
      ),
    );
  };

  const updateQuantity = (uniqueKey, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        `${item.id}-${item.size}-${item.color}` === uniqueKey
          ? { ...item, quantity: newQty }
          : item,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart: cartItems, // غيرنا الاسم لـ cart ليتناسب مع صفحة الـ checkout
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
