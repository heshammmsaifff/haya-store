"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiPackage,
  FiLogOut,
  FiChevronRight,
  FiRefreshCw,
  FiMail,
  FiShoppingBag,
} from "react-icons/fi";
import { PiExclamationMarkFill } from "react-icons/pi";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [resetLoading, setResetLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // جلب بيانات البروفايل
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        ...profileData,
        full_name:
          profileData?.full_name ||
          user?.user_metadata?.full_name ||
          "Guest User",
      });

      // 1. جلب الطلبات الأساسية
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersData) {
        // 2. تحديث بيانات المنتجات داخل كل طلب (جلب الصور والأسعار الحقيقية)
        const enrichedOrders = await Promise.all(
          ordersData.map(async (order) => {
            if (!order.items) return order;

            const enrichedItems = await Promise.all(
              order.items.map(async (item) => {
                const { data: prodInfo } = await supabase
                  .from("products")
                  .select(
                    "name, image_url, images, base_price, discount_type, discount_value",
                  )
                  .eq("id", item.product_id || item.id)
                  .single();

                if (prodInfo) {
                  // حساب السعر النهائي (في حال كان الخصم قد تغير أو للتأكد من القيمة)
                  let currentPrice = parseFloat(prodInfo.base_price);
                  if (prodInfo.discount_type === "percentage") {
                    currentPrice -=
                      currentPrice * (prodInfo.discount_value / 100);
                  } else if (prodInfo.discount_type === "fixed") {
                    currentPrice -= prodInfo.discount_value;
                  }

                  return {
                    ...item,
                    name: prodInfo.name, // لضمان ظهور الاسم حتى لو تغير
                    price: item.price || currentPrice, // نفضل السعر وقت الشراء إذا وجد
                    image:
                      prodInfo.image_url || prodInfo.images?.[0]?.urls?.[0],
                  };
                }
                return item;
              }),
            );
            return { ...order, items: enrichedItems };
          }),
        );
        setOrders(enrichedOrders);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-purple-100 text-purple-700 border-purple-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const translateStatus = (status) => {
    const trans = {
      pending: "Under Review",
      processing: "In Preparation",
      shipped: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return trans[status] || status;
  };

  const handlePasswordReset = async () => {
    try {
      setResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert("A password reset link has been sent to your email.");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white italic font-light tracking-[0.2em]">
        LOADING ACCOUNT...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 p-8 pt-16 text-center">
        <div className="w-20 h-20 bg-black text-white rounded-full mx-auto flex items-center justify-center text-2xl font-light mb-4 uppercase">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
        </div>
        <h1 className="text-2xl font-light tracking-[0.2em] uppercase">
          {profile?.full_name || "My Account"}
        </h1>
        <p className="text-gray-400 text-xs mt-2 tracking-widest">
          {user?.email}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2">
            Navigation
          </h3>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 text-sm font-medium transition-all ${activeTab === "orders" ? "text-black pl-2 border-l-2 border-black" : "text-gray-400 hover:text-black"}`}
            >
              <FiPackage size={18} /> My Orders
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center gap-3 text-sm font-medium transition-all ${activeTab === "details" ? "text-black pl-2 border-l-2 border-black" : "text-gray-400 hover:text-black"}`}
            >
              <FiUser size={18} /> Account Details
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm font-bold text-red-500 pt-4 border-t border-gray-50"
            >
              <FiLogOut size={18} /> Sign Out
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-2">
          {activeTab === "orders" ? (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em]">
                Recent Orders ({orders.length})
              </h2>
              {orders.length === 0 ? (
                <div className="border border-dashed p-12 text-center text-gray-400 italic text-sm">
                  No orders found.{" "}
                  <Link
                    href="/shop"
                    className="block mt-4 text-black not-italic font-bold underline"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id,
                      )
                    }
                    className={`border transition-all cursor-pointer ${expandedOrder === order.id ? "border-black" : "border-gray-100 hover:border-gray-300"}`}
                  >
                    <div className="p-6 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                          Order #{order.order_number || order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                        <div
                          className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 mt-2 inline-block border ${getStatusStyle(order.status)}`}
                        >
                          {translateStatus(order.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {order.total_amount} LE
                          </p>
                          <p className="text-[9px] text-gray-400 uppercase">
                            {order.items?.length || 0} Items
                          </p>
                        </div>
                        <FiChevronRight
                          className={`transition-transform ${expandedOrder === order.id ? "rotate-90" : ""}`}
                        />
                      </div>
                    </div>

                    {/* Order Items Detail */}
                    {expandedOrder === order.id && (
                      <div className="px-6 pb-6 pt-2 border-t border-gray-50 bg-neutral-50/50">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                          <FiShoppingBag /> Order Items
                        </h4>
                        <div className="space-y-4">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <div className="flex gap-4 items-center">
                                <div className="w-12 h-16 bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                                  <img
                                    src={
                                      item.image ||
                                      "https://via.placeholder.com/100?text=Product"
                                    }
                                    className="w-full h-full object-cover"
                                    alt={item.name}
                                    onError={(e) =>
                                      (e.target.src =
                                        "https://via.placeholder.com/100?text=Error")
                                    }
                                  />
                                </div>
                                <div className="text-xs">
                                  <p className="font-bold uppercase mb-1">
                                    {item.name || "Product"}
                                  </p>
                                  <p className="text-gray-400 text-[10px]">
                                    {item.size} / {item.color} x {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-xs">
                                {(
                                  (item.price || 0) * (item.quantity || 1)
                                ).toLocaleString()}{" "}
                                LE
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-[10px]">
                          <span className="font-bold uppercase">
                            Shipping Address
                          </span>
                          <span className="text-gray-500">
                            {order.city}, {order.customer_address}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Account Details Tab */
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em]">
                Account Details
              </h2>
              <div className="border border-black p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Full Name
                  </span>
                  <span className="text-sm font-medium">
                    {profile?.full_name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Email
                  </span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="flex items-center justify-between w-full p-4 border border-black hover:bg-black hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                      <FiRefreshCw
                        className={
                          resetLoading
                            ? "animate-spin"
                            : "group-hover:rotate-180 transition-all"
                        }
                      />
                      {resetLoading ? "Sending..." : "Reset Password"}
                    </div>
                    <FiMail />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
