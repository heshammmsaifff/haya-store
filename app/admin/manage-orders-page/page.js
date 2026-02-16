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
} from "react-icons/fi";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  }

  // دالة تحديث حالة الطلب
  async function updateOrderStatus(id, newStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // تحديث الحالة في الواجهة فوراً بدل إعادة التحميل بالكامل
      setOrders(
        orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
      );
    } else {
      alert("فشل تحديث الحالة: " + error.message);
    }
  }

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
  };

  if (loading)
    return (
      <div className="p-10 text-center font-black">جاري جلب الطلبات...</div>
    );

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <header className="mb-10 border-b-[6px] border-black pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
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
            count={stats.pending}
            color="bg-yellow-400"
          />
          <FilterBtn
            label="تجهيز"
            active={filter === "processing"}
            onClick={() => setFilter("processing")}
            count={stats.processing}
            color="bg-blue-400"
          />
          <FilterBtn
            label="تم التوصيل"
            active={filter === "delivered"}
            onClick={() => setFilter("delivered")}
            color="bg-green-400"
          />
        </div>
      </header>

      <div className="grid gap-8">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border-[3px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* بيانات العميل */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-2xl font-black">
                  <FiHash strokeWidth={3} />
                  <span>طلب رقم: {order.order_number}</span>
                </div>
                <div className="space-y-1 font-bold">
                  <p className="flex items-center gap-2">
                    <FiUser className="text-blue-600" /> {order.customer_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiPhone className="text-green-600" />{" "}
                    {order.customer_phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiMapPin className="text-red-600" /> {order.city} -{" "}
                    {order.customer_address}
                  </p>
                </div>
              </div>

              {/* المبلغ والحالة */}
              <div className="text-left md:text-right flex flex-col justify-between">
                <div>
                  <p className="text-sm font-black uppercase">إجمالي المبلغ</p>
                  <p className="text-3xl font-black text-green-600">
                    {order.total_amount} LE
                  </p>
                  <p className="text-xs font-bold mt-1">
                    تاريخ الطلب:{" "}
                    {new Date(order.created_at).toLocaleDateString("ar-EG")}
                  </p>
                </div>

                <div className="mt-4">
                  <span
                    className={`px-4 py-2 border-[2px] border-black font-black text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(order.status)}`}
                  >
                    {translateStatus(order.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* أزرار التحكم في الحالة */}
            <div className="mt-8 pt-6 border-t-[2px] border-black flex flex-wrap gap-3">
              <span className="w-full text-xs font-black uppercase mb-2">
                تغيير الحالة إلى:
              </span>
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
              />
              <StatusUpdateBtn
                label="شحن"
                icon={<FiTruck />}
                onClick={() => updateOrderStatus(order.id, "shipped")}
                active={order.status === "shipped"}
              />
              <StatusUpdateBtn
                label="توصيل"
                icon={<FiCheckCircle />}
                onClick={() => updateOrderStatus(order.id, "delivered")}
                active={order.status === "delivered"}
              />
              <StatusUpdateBtn
                label="إلغاء"
                icon={<FiXCircle />}
                onClick={() => updateOrderStatus(order.id, "cancelled")}
                active={order.status === "cancelled"}
                color="hover:bg-red-500"
              />
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 border-[3px] border-dashed border-black font-black text-2xl">
            لا توجد طلبات حالياً
          </div>
        )}
      </div>
    </div>
  );
}

// مكونات صغيرة مساعدة
function FilterBtn({ label, active, onClick, count, color = "bg-white" }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 border-[3px] border-black font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${active ? color : "bg-white hover:bg-gray-100"}`}
    >
      {label} {count !== undefined && `(${count})`}
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
  if (active) return null; // لا تظهر الزر إذا كان الطلب في هذه الحالة فعلاً
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border-[2px] border-black font-black text-xs transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-white ${color}`}
    >
      {icon} {label}
    </button>
  );
}

function translateStatus(status) {
  const trans = {
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
