"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import {
  FiSearch,
  FiUser,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiChevronRight,
  FiTrash2,
  FiMail,
} from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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

  // --- مصفوفة الروابط الرئيسية لسهولة التحكم ---
  const mainLinks = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "Collections", href: "/collections" },
    { name: "Contact", href: "/contact" },
  ];

  const syncCartWithDB = useCallback(async () => {
    if (cartItems.length === 0) return;
    setIsSyncing(true);
    try {
      const productIds = cartItems.map((item) => item.id);
      const { data: dbData, error: pError } = await supabase
        .from("products")
        .select(
          `
          id, name, base_price, discount_type, discount_value,
          product_variants (color, size, is_available, stock)
        `,
        )
        .in("id", productIds);

      if (pError) throw pError;

      for (const item of cartItems) {
        const dbProduct = dbData?.find((p) => p.id === item.id);
        const uniqueKey = `${item.id}-${item.size}-${item.color}`;
        if (!dbProduct) {
          removeFromCart(uniqueKey);
          continue;
        }

        const variant = dbProduct.product_variants?.find(
          (v) => v.color === item.color && v.size === item.size,
        );

        if (!variant || variant.is_available === false || variant.stock <= 0) {
          removeFromCart(uniqueKey);
          continue;
        }

        let currentActualPrice = parseFloat(dbProduct.base_price);
        if (dbProduct.discount_type === "percentage") {
          currentActualPrice -=
            (currentActualPrice * dbProduct.discount_value) / 100;
        } else if (dbProduct.discount_type === "fixed") {
          currentActualPrice -= dbProduct.discount_value;
        }

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
    if (isCartOpen) syncCartWithDB();
  }, [isCartOpen, syncCartWithDB]);

  useEffect(() => {
    fetchInitialData();
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);

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
      window.removeEventListener("resize", handleResize);
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
      {/* 1. Mobile Side Menu (Navigation + Categories) */}
      <div
        className={`fixed inset-0 z-[150] transition-all duration-500 ${isMenuOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 h-full w-[85%] max-w-[350px] bg-white transition-transform duration-500 ease-out flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 flex justify-between items-center border-b">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Navigation
            </span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2">
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Main Links */}
            <div className="py-4 border-b">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-8 py-4 text-xs font-black uppercase tracking-widest flex justify-between items-center ${pathname === link.href ? "text-black" : "text-gray-500"}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Categories */}
            <div className="py-4">
              <span className="px-8 text-[9px] font-black uppercase tracking-widest text-gray-300">
                Shop by Category
              </span>
              <div className="mt-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/collections?category=${cat.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-8 py-3 text-[11px] font-medium uppercase tracking-widest text-gray-600 flex justify-between items-center hover:bg-gray-50"
                  >
                    {cat.name}{" "}
                    <FiChevronRight size={14} className="opacity-20" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 border-t bg-gray-50 space-y-4">
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest"
            >
              <FiUser size={18} /> {user ? "My Profile" : "Account Login"}
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest"
            >
              <FiMail size={18} /> Get in touch
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Side Cart (كما هي مع تحسينات بسيطة) */}
      <div
        className={`fixed inset-0 z-[150] transition-all duration-500 ${isCartOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsCartOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">
              Shopping Bag ({cartCount})
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:rotate-90 transition-transform"
            >
              <FiX size={22} />
            </button>
          </div>
          {/* محتوى السلة ... */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4 group"
                >
                  <div className="w-20 h-28 bg-gray-50 flex-shrink-0 overflow-hidden">
                    <img
                      src={
                        typeof item.image === "string"
                          ? item.image
                          : item.image?.[0]
                      }
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest">
                          {item.name}
                        </h3>
                        <p className="text-[9px] text-gray-400 mt-1 uppercase">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(
                            `${item.id}-${item.size}-${item.color}`,
                          )
                        }
                        className="text-gray-300 hover:text-black transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-gray-400 font-bold">
                        QTY: {item.quantity}
                      </span>
                      <span className="text-xs font-black tracking-tighter">
                        {item.price.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <FiShoppingBag size={40} className="mb-4" />
                <p className="text-[10px] tracking-widest uppercase font-black">
                  Bag is empty
                </p>
              </div>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="p-8 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Subtotal
                </span>
                <span className="text-lg font-black italic">
                  {cartTotal.toLocaleString()} EGP
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/checkout");
                }}
                className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-900 transition-colors"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Search Overlay (PC & Mobile) */}
      <div
        className={`fixed inset-0 z-[200] bg-white transition-all duration-700 ease-in-out ${isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-6 right-6 md:top-10 md:right-10 p-4 hover:rotate-90 transition-transform"
        >
          <FiX size={30} />
        </button>
        <div className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto px-6">
          <form onSubmit={handleSearch} className="w-full">
            <input
              autoFocus={isSearchOpen}
              type="text"
              placeholder="START TYPING..."
              className="w-full bg-transparent border-b-2 border-black/10 py-6 md:py-10 text-xl md:text-6xl font-light uppercase outline-none focus:border-black transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <p className="mt-6 text-[10px] tracking-[0.3em] text-gray-400 uppercase font-black">
              Press enter to search or escape to close
            </p>
          </form>
        </div>
      </div>

      {/* 4. Navbar Main Design */}
      <nav className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 md:h-24 flex items-center transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 w-full flex justify-between items-center">
          {/* Left: Mobile Menu Trigger / Desktop Links */}
          {/* Left: Mobile Menu Trigger / Desktop Links */}
          <div className="flex items-center gap-6 flex-1">
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <FiMenu size={24} />
            </button>

            <div className="hidden md:flex items-center gap-8">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-50 ${
                    pathname === link.href ? "border-b-2 border-black pb-1" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-xl md:text-3xl font-light tracking-[0.5em] uppercase text-black hover:opacity-60 transition-opacity">
                HAYA
              </h1>
            </Link>
          </div>

          {/* Right: Actions (Search, Profile, Cart) */}
          <div className="flex items-center justify-end gap-1 md:gap-6 flex-1">
            {/* Search Icon (Always visible) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-3 hover:scale-110 transition-transform"
            >
              <FiSearch size={20} />
            </button>

            {/* Profile Icon (Desktop Only) */}
            <Link
              href={user ? "/profile" : "/login"}
              className="hidden md:flex p-3 hover:scale-110 transition-transform"
            >
              <FiUser size={20} />
            </Link>

            {/* Bag Icon (Always visible) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative p-3 flex items-center gap-2"
            >
              <div className="relative">
                <FiShoppingBag
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.2em]">
                Bag
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 md:h-24" />
    </>
  );
}
