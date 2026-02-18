"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FiPlus } from "react-icons/fi";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  // --- منطق استخراج الصورة الأكثر أماناً ---
  const getImageUrl = (imgData) => {
    if (!imgData) return null;
    if (typeof imgData === "string") return imgData; // إذا كانت الصورة رابط نصي مباشر
    if (Array.isArray(imgData)) return getImageUrl(imgData[0]); // إذا كانت مصفوفة، خذ أول عنصر
    if (typeof imgData === "object") return imgData.url || imgData.urls?.[0]; // إذا كان كائن
    return null;
  };

  // محاولة جلب الصورة الأساسية من عدة أماكن محتملة
  const mainImage =
    getImageUrl(product.image_url) ||
    getImageUrl(product.images) ||
    "https://placehold.co/400x600?text=HAYA";

  // محاولة جلب صورة الـ Hover (العنصر الثاني في المصفوفة إن وجد)
  const hoverImage =
    Array.isArray(product.images) && product.images.length > 1
      ? getImageUrl(product.images[1])
      : mainImage;

  const price = product.base_price || 0;
  const formattedPrice = price.toLocaleString();

  // حساب السعر النهائي بعد الخصم
  const finalPrice =
    product.discount_type === "percentage"
      ? price * (1 - product.discount_value / 100)
      : product.discount_type === "fixed"
        ? price - product.discount_value
        : price;

  const formattedFinalPrice = finalPrice.toLocaleString();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: mainImage,
      quantity: 1,
      size: "M",
      color: product.material || "Default",
    });
  };
  // فحص هل المنتج متاح (يوجد على الأقل مقاس واحد متاح)
  const isAvailable = product.product_variants?.some(
    (v) => v.is_available === true,
  );

  return (
    <div
      className={`group relative flex flex-col w-full ${!isAvailable ? "cursor-not-allowed" : "cursor-pointer"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 ${!isAvailable ? "opacity-50" : "opacity-100"}`}
            onError={(e) => {
              e.target.onerror = null; // يمنع الحلقة اللانهائية
              e.target.src = "https://placehold.co/400x600?text=Image+Error";
            }}
          />

          {!isAvailable && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="border-2 border-black px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] bg-white text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        {product.discount_value > 0 && (
          <span className="absolute top-2 left-2 bg-white text-black text-[7px] md:text-[9px] font-black uppercase px-2 py-1 shadow-sm z-10">
            -{product.discount_value}
            {product.discount_type === "percentage" ? "%" : " EGP"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-1">
              {product.category_name || product.sub_category?.name || "HAYA"}
            </p>
            <Link href={`/product/${product.id}`}>
              <h3 className="text-[11px] md:text-[13px] font-medium uppercase tracking-tight text-black line-clamp-1 group-hover:underline">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="flex flex-col items-end">
            {/* السعر النهائي (الحالي) */}
            <span className="text-[11px] md:text-sm font-black whitespace-nowrap">
              {formattedFinalPrice} <span className="text-[9px]">EGP</span>
            </span>

            {/* السعر القديم - يظهر فقط إذا كان هناك خصم */}
            {product.discount_value > 0 && (
              <span className="text-[9px] md:text-[10px] text-gray-400 line-through tracking-tighter">
                {formattedPrice} EGP
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
