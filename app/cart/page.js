"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";

export default function CartPage() {
  const { cartItems, removeFromCart, addToCart, cartCount } = useCart();
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.base_price * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <FiShoppingBag size={50} className="text-gray-200 mb-6" />
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4">
          Your bag is empty
        </h2>
        <p className="text-gray-400 text-xs mb-8 tracking-widest">
          LOOKS LIKE YOU HAVEN'T ADDED ANYTHING YET.
        </p>
        <Link
          href="/shop"
          className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
      <h1 className="text-2xl font-light tracking-[0.3em] uppercase mb-12 text-center md:text-left">
        Shopping Bag ({cartCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2 space-y-8">
          {cartItems.map((item) => (
            <div
              key={item.variant_id}
              className="flex gap-6 pb-8 border-b border-gray-100 items-center"
            >
              {/* صورة المنتج */}
              <div className="w-24 h-32 bg-gray-50 flex-shrink-0 relative">
                <img
                  src={item.image_url || item.images?.[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* تفاصيل المنتج */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => removeFromCart(item.variant_id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                  Code: {item.code}
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">
                  Size: {item.variant.size} | Color: {item.variant.color}
                </p>

                <div className="flex justify-between items-center mt-4">
                  {/* التحكم في الكمية */}
                  <div className="flex items-center border border-gray-200">
                    <button
                      className="p-2 hover:bg-gray-50"
                      onClick={() => {
                        // هنا ممكن تضيف دالة لتليل الكمية في الـ Context
                      }}
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="px-4 text-[10px] font-bold">
                      {item.quantity}
                    </span>
                    <button
                      className="p-2 hover:bg-gray-50"
                      onClick={() => addToCart(item, item.variant)}
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-bold tracking-tighter">
                    {item.base_price * item.quantity} LE
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ملخص الطلب - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-8 sticky top-32">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-200">
              Order Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs tracking-widest uppercase">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{subtotal} LE</span>
              </div>
              <div className="flex justify-between text-xs tracking-widest uppercase">
                <span className="text-gray-500">Shipping</span>
                <span className="text-[10px] italic">
                  Calculated at checkout
                </span>
              </div>
              <div className="h-[1px] bg-gray-200 my-4"></div>
              <div className="flex justify-between text-sm font-bold tracking-widest uppercase">
                <span>Total</span>
                <span>{subtotal} LE</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all group"
            >
              Proceed to Checkout{" "}
              <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <p className="text-[9px] text-gray-400 mt-6 leading-relaxed italic text-center">
              * Taxes and shipping are calculated based on your location during
              checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
