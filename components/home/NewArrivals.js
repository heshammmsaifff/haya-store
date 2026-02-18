"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

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

  const calculateFinalPrice = (basePrice, discountType, discountValue) => {
    const price = parseFloat(basePrice);
    const discount = parseFloat(discountValue || 0);
    if (!discount || discount <= 0) return price;
    if (discountType === "percentage") {
      return price - price * (discount / 100);
    } else {
      return price - discount;
    }
  };

  if (loading) return <ArrivalsSkeleton />;

  return (
    <section className="py-20 px-6 md:px-12 bg-white text-left" dir="ltr">
      <div className="flex flex-col mb-12">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 block mb-2">
          The Latest Pieces
        </span>
        <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tighter text-black">
          New Arrivals
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-16">
        {products.map((product) => {
          // استخراج الصور من مصفوفة الـ JSON
          // الصورة الأولى:
          const mainImage = product.images?.[0]?.urls?.[0] || product.image_url;

          // الصورة الثانية: (نبحث عنها في مصفوفة الـ urls لنفس اللون أو اللون اللي بعده)
          const hoverImage =
            product.images?.[0]?.urls?.[1] || // الصورة التانية لنفس اللون الأول
            product.images?.[1]?.urls?.[0] || // لو مفيش، ناخد أول صورة للون التاني
            null; // لو مفيش غير صورة واحدة خالص

          const finalPrice = calculateFinalPrice(
            product.base_price,
            product.discount_type,
            product.discount_value,
          );

          return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="group block"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-4">
                {/* Main Image (Visible by default) */}
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No Image
                  </div>
                )}

                {/* Hover Image (Visible ONLY on hover) */}
                {hoverImage && (
                  <img
                    src={hoverImage}
                    alt={`${product.name} alternate view`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out group-hover:scale-105"
                  />
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                  <span className="bg-black text-white text-[8px] uppercase px-2 py-1 tracking-widest">
                    New
                  </span>
                  {product.discount_value > 0 && (
                    <span className="bg-red-600 text-white text-[8px] uppercase px-2 py-1 tracking-widest">
                      Sale
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1 text-left">
                <h3 className="text-xs uppercase tracking-widest font-medium text-neutral-800">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 justify-start">
                  <p className="text-sm font-bold text-black">
                    {finalPrice.toLocaleString()} EGP
                  </p>
                  {product.discount_value > 0 && (
                    <span className="text-[11px] text-gray-400 line-through">
                      {parseFloat(product.base_price).toLocaleString()} EGP
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

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
