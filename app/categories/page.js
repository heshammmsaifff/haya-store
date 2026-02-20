"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllCategories() {
      try {
        const { data } = await supabase.from("categories").select("*");
        setCategories(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCategories();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[10px] uppercase tracking-widest">
        Loading Collections...
      </div>
    );

  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-light uppercase tracking-tighter text-black mb-4">
          Our Collections
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.4em]">
          Explore our curated categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/collections?category=${cat.id}`} // بنبعت الـ ID هنا كـ query param
            className="group relative aspect-[3/4] overflow-hidden bg-neutral-100"
          >
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                <span className="text-neutral-400 text-[10px] uppercase tracking-widest">
                  No Image
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10" />

            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.3em] mb-4">
                {cat.name}
              </h2>
              <div className="overflow-hidden">
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] border-b border-white pb-1 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                  View Products
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
