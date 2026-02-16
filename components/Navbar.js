"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import {
  FiSearch,
  FiUser,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiChevronRight,
} from "react-icons/fi";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchData();
    // منع التمرير عند فتح القائمة
    if (isMenuOpen) {
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
  }, [isMenuOpen]);

  async function fetchData() {
    const { data } = await supabase.from("categories").select("id, name");
    setCategories(data || []);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  return (
    <>
      {/* 1. القائمة الجانبية - أصبحت خارج الـ nav لضمان عدم التداخل */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}
      >
        {/* الخلفية المظلمة */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* محتوى القائمة */}
        <div
          className={`absolute top-0 left-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-500 ease-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                Haya Store
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-black uppercase tracking-widest hover:text-gray-500 transition-colors"
              >
                Home
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between text-sm font-black uppercase tracking-widest group"
                >
                  {cat.name}
                  <FiChevronRight className="text-gray-300 group-hover:text-black transition-colors" />
                </Link>
              ))}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <Link
                href={user ? "/profile" : "/login"}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 text-xs font-black uppercase tracking-widest"
              >
                <FiUser size={20} />
                {user ? "My Account" : "Login / Register"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. الـ Navbar الأساسي */}
      <nav className="fixed top-0 w-full z-[50] bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 md:h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex justify-between items-center">
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
            <FiMenu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-8 flex-1">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex-1 text-center">
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-light tracking-[0.4em] uppercase text-black">
                HAYA
              </h1>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-5 md:gap-8 flex-1">
            <button className="hidden md:block text-black hover:opacity-60 transition-opacity">
              <FiSearch size={20} />
            </button>
            <Link
              href={user ? "/profile" : "/login"}
              className="text-black hover:opacity-60 transition-opacity"
            >
              <FiUser size={20} />
            </Link>
            <Link
              href="/cart"
              className="relative text-black hover:opacity-60 transition-opacity"
            >
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-2 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer لتعويض ارتفاع الـ Navbar الثابت */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}
