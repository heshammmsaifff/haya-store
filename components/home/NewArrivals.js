"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "@/components/ProductCard"; // تأكد من مسار الاستيراد الصحيح

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        // جلب المنتجات مع الـ variants والـ sub_category لضمان عمل الـ Card بشكل كامل
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            sub_categories (name),
            product_variants (
              is_available
            )
          `,
          )
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching arrivals:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNewArrivals();
  }, []);

  if (loading) return <ArrivalsSkeleton />;

  return (
    <section className="py-20 px-6 md:px-12 bg-white text-left" dir="ltr">
      {/* Header Section */}
      <div className="flex flex-col mb-12">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 block mb-2">
          The Latest Pieces
        </span>
        <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tighter text-black">
          New Arrivals
        </h2>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Footer Section */}
      <div className="flex justify-center">
        <Link
          href="/collections"
          className="group flex items-center gap-3 border border-black px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 text-black"
        >
          Explore Collection
          <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

// Skeleton Loading
function ArrivalsSkeleton() {
  return (
    <div
      className="py-20 px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8"
      dir="ltr"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
          <div className="h-4 w-3/4 bg-neutral-100 animate-pulse" />
          <div className="h-4 w-1/4 bg-neutral-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
