"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { FiTrash2, FiArrowRight, FiShoppingBag } from "react-icons/fi";

const COLOR_TRANSLATIONS = {
  أسود: "Black",
  أبيض: "White",
  "أوف وايت": "Off-White",
  "بيج / نود": "Beige / Nude",
  كشمير: "Cashmere",
  "موف / لافندر": "Lavender",
  كحلي: "Navy Blue",
  سماوي: "Sky Blue",
  زيتي: "Olive",
  "مينت جرين": "Mint Green",
  رمادي: "Grey",
  فوشيا: "Fuchsia",
  "أحمر زاهي": "Red",
  نبيتي: "Burgundy",
  مستردة: "Mustard",
  "بني شيكولاتة": "Chocolate Brown",
  "مرجاني (كورال)": "Coral",
  بستاج: "Pistachio",
  تراكوتا: "Terracotta",
  ليلكي: "Lilac",
};

export default function CartPage() {
  const { cartItems, removeFromCart, cartCount } = useCart(); // حذفنا updateQuantity و addToCart

  const getItemFinalPrice = (item) => {
    const base = parseFloat(item.base_price) || 0;
    const disc = parseFloat(item.discount_value) || 0;
    if (item.discount_type === "percentage") return base - (base * disc) / 100;
    if (item.discount_type === "fixed") return base - disc;
    return base;
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + getItemFinalPrice(item) * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <FiShoppingBag size={50} className="text-gray-200 mb-6" />
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4">
          Your bag is empty
        </h2>
        <Link
          href="/shop"
          className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em]"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16" dir="ltr">
      <h1 className="text-2xl font-light tracking-[0.3em] uppercase mb-12 text-center md:text-left">
        Shopping Bag ({cartCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cartItems.map((item) => {
            const finalPrice = getItemFinalPrice(item);
            const hasDiscount =
              item.discount_type !== "none" && item.discount_value > 0;

            return (
              <div
                key={item.variant_id}
                className="flex gap-6 pb-8 border-b border-gray-100 items-center"
              >
                <div className="w-24 h-32 bg-gray-50 flex-shrink-0">
                  <img
                    src={item.image_url || item.images?.[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      className="text-gray-400 hover:text-black transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 uppercase">
                    Code: {item.code}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">
                    Size: {item.variant.size} | Color:{" "}
                    {COLOR_TRANSLATIONS[item.variant.color] ||
                      item.variant.color}
                  </p>

                  <div className="flex justify-between items-end mt-6">
                    <div className="text-right">
                      {hasDiscount && (
                        <p className="text-[10px] text-gray-400 line-through mb-0.5">
                          {(item.base_price * item.quantity).toLocaleString()}{" "}
                          EGP
                        </p>
                      )}
                      <p className="text-sm font-bold tracking-tighter">
                        {(finalPrice * item.quantity).toLocaleString()} EGP
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-8 sticky top-32">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-200">
              Order Summary
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs tracking-widest uppercase">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">
                  {subtotal.toLocaleString()} EGP
                </span>
              </div>
              <div className="h-[1px] bg-gray-200 my-4"></div>
              <div className="flex justify-between text-sm font-bold tracking-widest uppercase">
                <span>Total</span>
                <span>{subtotal.toLocaleString()} EGP</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3"
            >
              Proceed to Checkout <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
