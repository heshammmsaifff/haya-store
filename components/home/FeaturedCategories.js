"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCats() {
      const { data } = await supabase.from("categories").select("*").limit(3);
      setCategories(data || []);
    }
    fetchCats();
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            href={`/collection?category=${cat.id}`}
            key={cat.id}
            className="group relative aspect-[4/5] overflow-hidden bg-gray-100"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all z-10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
              <h3 className="text-2xl font-light uppercase tracking-widest mb-2">
                {cat.name}
              </h3>
              <span className="text-[10px] uppercase tracking-widest border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-all">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
