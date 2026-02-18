"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCats() {
      try {
        const { data } = await supabase.from("categories").select("*").limit(3);

        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCats();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-neutral-200 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="flex justify-between">
        <h2 className="text-4xl md:text-5xl mb-10 font-light uppercase tracking-tighter text-black">
          Latest Categories
        </h2>
        <Link className="underline text-right" href={"/collection"}>
          show all collection
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <Link
            href={`/collection?category=${cat.id}`}
            key={cat.id}
            className="group relative aspect-[4/5] overflow-hidden bg-neutral-100"
          >
            {/* عرض الصورة الخلفية */}
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              // خلفية احتياطية في حال عدم وجود صورة
              <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                <span className="text-neutral-400 text-xs uppercase tracking-widest">
                  No Image
                </span>
              </div>
            )}

            {/* طبقة التغبيش السوداء (Overlay) */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-500 z-10" />

            {/* المحتوى النصي */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white p-4">
              <h3 className="text-2xl md:text-3xl font-light uppercase tracking-[0.3em] mb-4 text-center">
                {cat.name}
              </h3>

              <div className="overflow-hidden">
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] border-b border-white pb-1 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
