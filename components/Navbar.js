"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiUser,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateCartItemData,
    cartCount,
    cartTotal,
  } = useCart();

  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- دالة المزامنة المحدثة بناءً على الـ Schema الخاصة بك ---
  const syncCartWithDB = useCallback(async () => {
    if (cartItems.length === 0) return;

    setIsSyncing(true);
    try {
      const productIds = cartItems.map((item) => item.id);

      // جلب البيانات مع الربط بين جدول المنتجات وجدول المتغيرات (Variants)
      const { data: dbData, error: pError } = await supabase
        .from("products")
        .select(
          `
          id, 
          name, 
          base_price, 
          discount_type, 
          discount_value,
          product_variants (
            color,
            size,
            is_available,
            stock
          )
        `,
        )
        .in("id", productIds);

      if (pError) throw pError;

      for (const item of cartItems) {
        const dbProduct = dbData?.find((p) => p.id === item.id);
        const uniqueKey = `${item.id}-${item.size}-${item.color}`;

        // 1. التحقق من وجود المنتج
        if (!dbProduct) {
          removeFromCart(uniqueKey);
          continue;
        }

        // 2. التحقق من توفر المتغير المحدد (اللون والمقاس)
        const variant = dbProduct.product_variants?.find(
          (v) => v.color === item.color && v.size === item.size,
        );

        if (!variant || variant.is_available === false || variant.stock <= 0) {
          removeFromCart(uniqueKey);
          continue;
        }

        // 3. حساب السعر الحالي بناءً على القواعد الخاصة بك
        let currentActualPrice = parseFloat(dbProduct.base_price);
        const dType = dbProduct.discount_type;
        const dValue = parseFloat(dbProduct.discount_value || 0);

        if (dType === "percentage") {
          currentActualPrice -= (currentActualPrice * dValue) / 100;
        } else if (dType === "fixed") {
          currentActualPrice -= dValue;
        }

        // 4. تحديث البيانات في السلة إذا تغير السعر أو الاسم
        if (
          Math.round(item.price) !== Math.round(currentActualPrice) ||
          item.name !== dbProduct.name
        ) {
          updateCartItemData(uniqueKey, {
            price: currentActualPrice,
            name: dbProduct.name,
          });
        }
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [cartItems, removeFromCart, updateCartItemData]);

  useEffect(() => {
    if (isCartOpen) {
      syncCartWithDB();
    }
  }, [isCartOpen, syncCartWithDB]);

  useEffect(() => {
    fetchInitialData();

    if (isMenuOpen || isCartOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isCartOpen, isSearchOpen]);

  async function fetchInitialData() {
    const { data: cats } = await supabase.from("categories").select("id, name");
    setCategories(cats || []);
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/collections?search=${encodeURIComponent(searchQuery.trim())}`,
      );
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* 1. Mobile Menu */}
      <div
        className={`fixed inset-0 z-[130] transition-all duration-500 ${isMenuOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-white transition-transform duration-500 ease-in-out flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 flex justify-between items-center border-b">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Menu
            </span>
            <button onClick={() => setIsMenuOpen(false)}>
              <FiX size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6">
            <div className="flex flex-col">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collections?category=${cat.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-8 py-4 text-xs font-medium uppercase tracking-widest text-gray-600 border-b border-gray-50 flex justify-between items-center"
                >
                  {cat.name} <FiChevronRight size={12} className="opacity-30" />
                </Link>
              ))}
            </div>
          </div>
          <div className="p-8 border-t bg-gray-50">
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest"
            >
              <FiUser size={18} /> {user ? "My Account" : "Login / Register"}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Side Cart */}
      <div
        className={`fixed inset-0 z-[130] transition-all duration-500 ${isCartOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsCartOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="p-6 border-b flex justify-between items-center bg-white">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">
              Your Bag ({cartCount}){" "}
              {isSyncing && (
                <span className="ml-2 animate-pulse text-gray-400 italic font-normal">
                  Syncing...
                </span>
              )}
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:rotate-90 transition-transform"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const uniqueKey = `${item.id}-${item.size}-${item.color}`;
                return (
                  <div
                    key={uniqueKey}
                    className="flex gap-4 group animate-in fade-in slide-in-from-right-4"
                  >
                    <div className="w-24 h-32 bg-gray-50 overflow-hidden flex-shrink-0 relative">
                      <img
                        src={
                          typeof item.image === "string"
                            ? item.image
                            : item.image?.[0] ||
                              "https://placehold.co/400x600?text=No+Image"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-widest leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[9px] text-gray-400 uppercase mt-1">
                            {item.color} / {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(uniqueKey)}
                          className="text-gray-300 hover:text-black transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">
                          QTY: {item.quantity}
                        </span>
                        <span className="text-xs font-black tracking-tighter">
                          {(item.price * item.quantity).toLocaleString()} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <p className="text-[10px] tracking-[0.2em] uppercase font-black text-gray-400">
                  Your bag is currently empty
                </p>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-8 border-t bg-white">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Total
                </span>
                <span className="text-xl font-black italic">
                  {cartTotal.toLocaleString()} EGP
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/checkout");
                }}
                className="w-full bg-black text-white py-6 text-[10px] font-black uppercase tracking-[0.4em]"
              >
                Go to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Search Overlay */}
      <div
        className={`fixed inset-0 z-[150] bg-white transition-all duration-700 ease-in-out ${isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-8 right-8 p-4 hover:rotate-90 transition-transform"
        >
          <FiX size={30} />
        </button>
        <div className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto px-6">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              autoFocus={isSearchOpen}
              type="text"
              placeholder="SEARCH..."
              className="w-full bg-transparent border-b border-black/10 py-8 text-2xl md:text-6xl font-light uppercase outline-none focus:border-black transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-4"
            >
              <FiSearch size={32} />
            </button>
          </form>
        </div>
      </div>

      {/* 4. Navbar Main */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 md:h-24 flex items-center transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 w-full flex justify-between items-center">
          <div className="flex items-center gap-8 flex-1">
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-10">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-all"
              >
                <FiSearch
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />
                <span className="hidden lg:block">Search</span>
              </button>
              <Link
                href="/collections"
                className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-all"
              >
                Collections
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl md:text-4xl font-light tracking-[0.6em] uppercase text-black hover:opacity-70 transition-opacity">
                HAYA
              </h1>
            </Link>
          </div>
          <div className="flex items-center justify-end gap-2 md:gap-10 flex-1">
            <Link
              href={user ? "/profile" : "/login"}
              className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-all"
            >
              <FiUser size={20} />
              <span className="hidden lg:block">
                {user ? "Account" : "Login"}
              </span>
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative p-3 flex items-center gap-2"
            >
              <div className="relative">
                <FiShoppingBag
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-gray-400 transition-all">
                Bag
              </span>
            </button>
          </div>
        </div>
      </nav>
      <div className="h-16 md:h-24" />
    </>
  );
}
