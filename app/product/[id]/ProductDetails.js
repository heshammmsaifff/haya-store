"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import {
  FiPlus,
  FiMinus,
  FiHeart,
  FiShield,
  FiRefreshCw,
  FiCheck,
} from "react-icons/fi";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات الاختيار
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  async function fetchProductData() {
    try {
      // 1. جلب بيانات المنتج والـ variants في وقت واحد
      const [productRes, variantsRes] = await Promise.all([
        supabase
          .from("products")
          .select(`*, sub_categories(name)`)
          .eq("id", id)
          .single(),
        supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", id)
          .eq("is_available", true),
      ]);

      if (productRes.error) throw productRes.error;

      const productData = productRes.data;
      const variantsData = variantsRes.data || [];

      // 2. معالجة الصور من الـ JSONB
      let allPhotos = [];
      if (productData.image_url) allPhotos.push(productData.image_url);
      if (Array.isArray(productData.images)) {
        productData.images.forEach((item) => {
          if (item.urls && Array.isArray(item.urls)) {
            allPhotos = [...allPhotos, ...item.urls];
          }
        });
      }

      setProduct({ ...productData, all_photos: allPhotos });
      setVariants(variantsData);
      setSelectedImage(
        allPhotos[0] || "https://placehold.co/400x600?text=HAYA",
      );
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // استخراج الألوان الفريدة المتاحة
  const availableColors = Array.from(new Set(variants.map((v) => v.color))).map(
    (colorName) => {
      return variants.find((v) => v.color === colorName);
    },
  );

  const COLOR_TRANSLATIONS = {
    أسود: "Black",
    أبيض: "White",
    "أوف وايت": "Off White",
    "بيج / نود": "Beige / Nude",
    كشمير: "Cashmere",
    "موف / لافندر": "Mauve / Lavender",
    كحلي: "Navy Blue",
    سماوي: "Sky Blue",
    زيتي: "Olive Green",
    "مينت جرين": "Mint Green",
    رمادي: "Grey",
    فوشيا: "Fuchsia",
    "أحمر زاهي": "Bright Red",
    نبيتي: "Burgundy",
    مستردة: "Mustard",
    "بني شيكولاتة": "Chocolate Brown",
    "مرجاني (كورال)": "Coral",
    بستاج: "Pistachio",
    تراكوتا: "Terracotta",
    ليلكي: "Lilac",
  };

  // استخراج المقاسات المتاحة بناءً على اللون المختار
  const availableSizes = variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center tracking-[0.5em] text-[10px] uppercase">
        HAYA Loading...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found.
      </div>
    );

  const finalPrice =
    product.discount_type === "percentage"
      ? product.base_price * (1 - product.discount_value / 100)
      : product.discount_type === "fixed"
        ? product.base_price - product.discount_value
        : product.base_price;

  // التحقق من إمكانية الإضافة للسلة
  const canAddToCart = selectedColor && selectedSize;

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* معرض الصور */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-auto md:w-20 shrink-0 scrollbar-hide">
              {product.all_photos?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-[3/4] border w-16 md:w-full shrink-0 ${selectedImage === img ? "border-black" : "border-transparent"} bg-neutral-50`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] bg-neutral-50 overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* تفاصيل المنتج */}
          <div className="lg:col-span-5 flex flex-col">
            <header className="border-b border-neutral-100 pb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-2">
                Code: {product.code}
              </p>
              <h1 className="text-3xl font-light uppercase tracking-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 font-bold mb-6">
                <span className="text-2xl italic">
                  {finalPrice.toLocaleString()} EGP
                </span>
                {product.discount_value > 0 && (
                  <span className="text-neutral-400 line-through text-sm font-normal">
                    {Number(product.base_price).toLocaleString()} EGP
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mt-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 text-black">
                    Description
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-light max-w-md">
                    {product.description}
                  </p>
                </div>
              )}
            </header>

            <div className="py-8 space-y-8">
              {/* اختيار اللون */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">
                  Available Colors:{" "}
                  <span className="text-neutral-400 font-normal">
                    {COLOR_TRANSLATIONS[selectedColor] ||
                      selectedColor ||
                      "Select a color"}
                  </span>
                </h3>
                <div className="flex gap-3">
                  {availableColors.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedColor(v.color);
                        setSelectedSize(null);
                      }}
                      title={COLOR_TRANSLATIONS[v.color] || v.color} // ترجمة التول تيب
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${selectedColor === v.color ? "border-black scale-110" : "border-neutral-200"}`}
                      style={{ backgroundColor: v.color_code || v.color }}
                    >
                      {selectedColor === v.color && (
                        <FiCheck
                          size={12}
                          className={
                            v.color === "أبيض" || v.color === "White"
                              ? "text-black"
                              : "text-white"
                          }
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* اختيار المقاس */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">
                  Size:{" "}
                  <span className="text-neutral-400 font-normal">
                    {selectedSize || "Select a size"}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedColor ? (
                    availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 text-[10px] border transition-all ${selectedSize === size ? "bg-black text-white border-black" : "border-neutral-200 hover:border-black"}`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <p className="text-[10px] text-neutral-400 italic">
                      Please select a color first
                    </p>
                  )}
                </div>
              </div>

              {/* الإضافة للسلة */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center border border-neutral-200">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-2 hover:bg-neutral-50"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-4 py-2 hover:bg-neutral-50"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>

                  <button
                    disabled={!canAddToCart}
                    onClick={() => {
                      addToCart({
                        ...product,
                        price: finalPrice,
                        quantity,
                        size: selectedSize,
                        color:
                          COLOR_TRANSLATIONS[selectedColor] || selectedColor,
                        image: selectedImage,
                      });

                      // إظهار التنبيه بشكل أنيق
                      toast.success(`${product.name} added to bag`, {
                        style: {
                          border: "1px solid #000",
                          padding: "16px",
                          color: "#000",
                          borderRadius: "0", // لجعل التصميم حاد (Minimalist)
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontWeight: "bold",
                        },
                        iconTheme: {
                          primary: "#000",
                          secondary: "#fff",
                        },
                      });
                    }}
                    className={`flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-5 transition-all ${
                      canAddToCart
                        ? "bg-black text-white hover:bg-neutral-800"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    {canAddToCart ? "Add to Bag" : "Select Color & Size"}
                  </button>
                </div>
              </div>
            </div>

            {/* تفاصيل إضافية */}
            <div className="mt-auto border-t pt-8 grid grid-cols-2 gap-4">
              <div className="flex gap-3 items-center">
                <FiShield className="text-neutral-300" size={18} />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                  {product.material || "Premium Fabric"}
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <FiRefreshCw className="text-neutral-300" size={18} />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                  {product.care_instructions || "Care Instructions"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
