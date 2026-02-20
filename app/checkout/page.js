"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, clearCart, cartTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const SHIPPING_FEE = 0;
  const totalWithShipping = cartTotal + SHIPPING_FEE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("سلة المشتريات فارغة!");
    setLoading(true);

    try {
      // 1. محاولة جلب بيانات المستخدم الحالي
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. استدعاء الـ Database Function (RPC)
      // هذه الوظيفة تقوم بتسجيل الطلب وخصم المخزون في خطوة واحدة
      // داخل handleSubmit
      // داخل handleSubmit في ملف page.js
      const { error } = await supabase.rpc("place_order_and_reduce_stock", {
        p_customer_name: formData.name,
        p_customer_phone: formData.phone,
        p_customer_address: formData.address,
        p_city: formData.city,
        p_total_amount: totalWithShipping,
        p_user_id: user?.id || null,
        p_items: cart.map((item) => ({
          product_id: item.id, // تأكد ان ده هو الـ id الموجود في جدول products
          color: String(item.color).trim(),
          size: String(item.size).trim(),
          quantity: parseInt(item.quantity),
        })),
      });

      if (error) {
        // إذا كان الخطأ متعلق بالمخزون (مثلاً الكمية المطلوبة أكبر من المتوفر)
        console.error("Order Error:", error);
        throw new Error(error.message || "حدث خطأ أثناء المحاولة");
      }

      // 3. نجاح العملية
      clearCart();
      alert("تم تسجيل طلبك بنجاح !");
      router.push("/");
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("فشل إتمام الطلب: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12"
      dir="ltr"
    >
      <div className="space-y-8">
        <h1 className="text-2xl font-light uppercase tracking-widest border-b pb-4">
          Checkout
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full Name"
            className="w-full border-b py-3 outline-none focus:border-black transition-all text-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            required
            type="tel"
            placeholder="Phone Number"
            className="w-full border-b py-3 outline-none focus:border-black transition-all text-sm"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <input
            required
            placeholder="City"
            className="w-full border-b py-3 outline-none focus:border-black transition-all text-sm"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <textarea
            required
            placeholder="Full Address (Street, Building, Apartment)"
            className="w-full border-b py-3 outline-none focus:border-black transition-all text-sm h-24 resize-none"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Complete Purchase"}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Section */}
      <div className="bg-neutral-50 p-8 h-fit border border-neutral-100">
        <h2 className="text-sm font-bold uppercase mb-6 tracking-widest">
          Summary
        </h2>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{cartTotal.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span>{SHIPPING_FEE.toLocaleString()} For Limited Time</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-4 text-lg">
            <span>Total</span>
            <span>{totalWithShipping.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Mini Item List */}
        <div className="space-y-3 border-t pt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4">
            Your Items
          </p>
          {cart.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <div className="w-12 h-16 bg-gray-200 flex-shrink-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase">{item.name}</p>
                <p className="text-[10px] text-gray-400">
                  {item.size} / {item.color} x {item.quantity}
                </p>
              </div>
              <span className="text-xs font-bold">
                {(item.price * item.quantity).toLocaleString()} LE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
