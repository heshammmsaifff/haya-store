"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPhone,
  FiMapPin,
  FiUser,
  FiHash,
  FiShoppingCart,
  // FiCalendar,
  // FiRefreshCcw,
} from "react-icons/fi";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const updatedOrders = await Promise.all(
        ordersData.map(async (order) => {
          if (!order.items || !Array.isArray(order.items)) return order;

          const enrichedItems = await Promise.all(
            order.items.map(async (item) => {
              // جلب بيانات المنتج مع تفاصيل الخصم
              const { data: prodInfo } = await supabase
                .from("products")
                .select(
                  "name, code, material, image_url, images, base_price, discount_type, discount_value",
                )
                .eq("id", item.product_id || item.id)
                .single();

              if (prodInfo) {
                // --- منطق حساب السعر بعد الخصم ---
                let finalPrice = parseFloat(prodInfo.base_price);
                const discountValue = parseFloat(prodInfo.discount_value || 0);

                if (prodInfo.discount_type === "percentage") {
                  // السعر بعد خصم النسبة: Price * (1 - Discount / 100)
                  finalPrice = finalPrice - finalPrice * (discountValue / 100);
                } else if (prodInfo.discount_type === "fixed") {
                  // السعر بعد الخصم الثابت: Price - Discount
                  finalPrice = finalPrice - discountValue;
                }
                // -------------------------------

                return {
                  ...item,
                  name: prodInfo.name,
                  code: prodInfo.code,
                  material: prodInfo.material,
                  // نستخدم السعر المحسوب بعد الخصم
                  price: finalPrice,
                  image_url:
                    prodInfo.image_url || prodInfo.images?.[0]?.urls?.[0],
                };
              }
              return item;
            }),
          );
          return { ...order, items: enrichedItems };
        }),
      );

      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id, newStatus) {
    const isConfirmed = window.confirm(
      `هل أنت متأكد من تغيير حالة الطلب إلى "${translateStatus(newStatus)}"؟`,
    );
    if (!isConfirmed) return;

    setUpdatingId(id);
    const now = new Date().toISOString();

    try {
      let { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: now })
        .eq("id", id);

      if (error) {
        // محاولة بديلة في حال عدم وجود عمود updated_at
        const fallback = await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", id);
        if (fallback.error) throw fallback.error;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: newStatus, updated_at: now } : o,
        ),
      );
      alert("تم التحديث بنجاح");
    } catch (err) {
      alert("خطأ في التحديث: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading)
    return (
      <div className="p-10 text-center font-black text-2xl animate-pulse">
        جاري تحميل البيانات وتفاصيل المنتجات...
      </div>
    );

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <header className="mb-10 border-b-[6px] border-black pb-6">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
          إدارة الطلبات
        </h1>
        <div className="flex gap-4 mt-6 flex-wrap">
          <FilterBtn
            label="الكل"
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={orders.length}
          />
          <FilterBtn
            label="مراجعة"
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
            color="bg-yellow-400"
          />
          <FilterBtn
            label="تجهيز"
            active={filter === "processing"}
            onClick={() => setFilter("processing")}
            color="bg-blue-400"
          />
        </div>
      </header>

      <div className="grid gap-12">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${updatingId === order.id ? "opacity-50" : ""}`}
          >
            {/* معلومات العميل */}
            <div className="p-6 border-b-[4px] border-black flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-3xl font-black italic">
                  <FiHash className="bg-black text-white p-1" />
                  <span>طلب #{order.order_number || order.id.slice(0, 5)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                  <p className="flex items-center gap-2">
                    <FiUser /> {order.customer_name}
                  </p>
                  <p className="flex items-center gap-2" dir="ltr">
                    <FiPhone /> {order.customer_phone}
                  </p>
                  <p className="flex items-center gap-2 col-span-full">
                    <FiMapPin /> {order.city} - {order.customer_address}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-gray-400">إجمالي الطلب</p>
                <p className="text-4xl font-black text-green-600">
                  {order.total_amount} LE
                </p>
                <div className="mt-2 inline-block px-4 py-1 border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100">
                  {translateStatus(order.status)}
                </div>
              </div>
            </div>

            {/* عرض المنتجات */}
            <div className="bg-neutral-50 p-6 border-b-[4px] border-black">
              <h3 className="flex items-center gap-2 font-black text-xl mb-6">
                <FiShoppingCart /> تفاصيل المنتجات:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col"
                  >
                    <div className="bg-black text-white px-3 py-1 flex justify-between text-[10px] font-mono uppercase">
                      <span>CODE: {item.code || "N/A"}</span>
                      <span className="bg-red-600 px-2 font-black">
                        الكمية: {item.quantity}
                      </span>
                    </div>

                    <div className="p-4 flex gap-4 text-right">
                      <div className="flex-1 order-2">
                        <h4 className="font-black text-sm uppercase mb-1 leading-tight">
                          {item.name || "جاري التحميل..."}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-bold mb-2">
                          الخامة: {item.material || "غير محددة"}
                        </p>
                        <div className="flex gap-2">
                          <span className="border border-black px-1 py-0.5 text-[9px] font-black uppercase">
                            SIZE: {item.size || "N/A"}
                          </span>
                          <span className="bg-black text-white px-1 py-0.5 text-[9px] font-black uppercase">
                            {item.color || "Default"}
                          </span>
                        </div>
                      </div>
                      <div className="w-20 h-24 border-2 border-black flex-shrink-0 order-1 overflow-hidden bg-white">
                        <img
                          src={
                            item.image_url ||
                            "https://via.placeholder.com/150?text=No+Image"
                          }
                          className="w-full h-full object-cover"
                          alt="product"
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/150?text=Error")
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-400 border-t-[2px] border-black p-2 flex justify-between items-center mt-auto">
                      <div>
                        <p className="text-[8px] font-black uppercase opacity-60">
                          سعر الوحدة
                        </p>
                        <p className="font-black text-xs">
                          {item.price || 0} LE
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] font-black uppercase opacity-60">
                          الإجمالي
                        </p>
                        <p className="font-black text-sm">
                          {(item.price * item.quantity).toLocaleString()} LE
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار الحالة */}
            <div className="p-6 flex flex-wrap gap-4 bg-white">
              <StatusUpdateBtn
                label="مراجعة"
                icon={<FiClock />}
                onClick={() => updateOrderStatus(order.id, "pending")}
                active={order.status === "pending"}
              />
              <StatusUpdateBtn
                label="تجهيز"
                icon={<FiPackage />}
                onClick={() => updateOrderStatus(order.id, "processing")}
                active={order.status === "processing"}
                color="hover:bg-blue-400"
              />
              <StatusUpdateBtn
                label="تم الشحن"
                icon={<FiTruck />}
                onClick={() => updateOrderStatus(order.id, "shipped")}
                active={order.status === "shipped"}
                color="hover:bg-purple-400"
              />
              <StatusUpdateBtn
                label="تم التوصيل"
                icon={<FiCheckCircle />}
                onClick={() => updateOrderStatus(order.id, "delivered")}
                active={order.status === "delivered"}
                color="hover:bg-green-400"
              />
              <StatusUpdateBtn
                label="إلغاء"
                icon={<FiXCircle />}
                onClick={() => updateOrderStatus(order.id, "cancelled")}
                active={order.status === "cancelled"}
                color="hover:bg-red-500 hover:text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// المكونات الفرعية (Sub-components)
function FilterBtn({ label, active, onClick, count, color = "bg-white" }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 border-[3px] border-black font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${active ? color : "bg-white"}`}
    >
      {label}{" "}
      {count !== undefined && (
        <span className="mr-2 bg-black text-white px-2 py-0.5 text-xs">
          {count}
        </span>
      )}
    </button>
  );
}

function StatusUpdateBtn({
  label,
  icon,
  onClick,
  active,
  color = "hover:bg-yellow-400",
}) {
  if (active) return null;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border-[3px] border-black font-black text-xs transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-white ${color}`}
    >
      {icon} {label}
    </button>
  );
}

function translateStatus(status) {
  const trans = {
    all: "الكل",
    pending: "مراجعة",
    processing: "تجهيز",
    shipped: "تم الشحن",
    delivered: "تم التوصيل",
    cancelled: "ملغي",
  };
  return trans[status] || status;
}

function getStatusColor(status) {
  const colors = {
    pending: "bg-yellow-400",
    processing: "bg-blue-400",
    shipped: "bg-purple-400",
    delivered: "bg-green-400",
    cancelled: "bg-red-500 text-white",
  };
  return colors[status] || "bg-white";
}
