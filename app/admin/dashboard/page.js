"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiBox,
  FiTrendingUp,
  FiTruck,
  FiAlertTriangle,
  FiTrash2,
  FiDatabase,
  FiHardDrive,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    outOfStock: 0,
    totalRevenue: 0,
    processingOrders: 0,
    dbSize: 0,
    storageSize: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. وظيفة التحقق من الهوية والصلاحيات فور تحميل الصفحة
    const checkAdminAndFetch = async () => {
      try {
        setLoading(true);

        // جلب المستخدم الحالي من الجلسة (Session)
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Access Denied: No authenticated user.");
          window.location.href = "/login"; // تحويل قسري للوجن
          return;
        }

        // جلب البروفايل للتأكد من رتبة الأدمن
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile || !profile.is_admin) {
          console.error("Access Denied: User is not an admin.");
          window.location.href = "/"; // تحويل قسري للرئيسية
          return;
        }

        // إذا نجح التحقق، نبدأ بجلب بيانات الداشبورد
        await fetchDashboardData();
      } catch (err) {
        console.error("Security Check Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, []);

  async function fetchDashboardData() {
    try {
      // 1. جلب إحصائيات الطلبات
      const { data: ordersData } = await supabase
        .from("orders")
        .select("status, total_amount");

      const ordersStats = (ordersData || []).reduce(
        (acc, curr) => {
          if (curr.status === "delivered")
            acc.revenue += curr.total_amount || 0;
          if (curr.status === "processing") acc.processing += 1;
          return acc;
        },
        { revenue: 0, processing: 0 },
      );

      // 2. جلب النواقص
      const { count: outOfStockCount } = await supabase
        .from("product_variants")
        .select("*", { count: "exact", head: true })
        .eq("is_available", false);

      // 3. جلب آخر 5 طلبات
      const { data: latestOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // 4. حساب حجم الـ Storage
      const { data: pStorageFiles } = await supabase.storage
        .from("product-images")
        .list();
      const { data: hStorageFiles } = await supabase.storage
        .from("header-images")
        .list();

      const pBytes =
        pStorageFiles?.reduce((acc, f) => acc + (f.metadata?.size || 0), 0) ||
        0;
      const hBytes =
        hStorageFiles?.reduce((acc, f) => acc + (f.metadata?.size || 0), 0) ||
        0;
      const totalMB = ((pBytes + hBytes) / (1024 * 1024)).toFixed(2);

      // 5. تقدير حجم الداتابيز
      const { count: pCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      const { count: vCount } = await supabase
        .from("product_variants")
        .select("*", { count: "exact", head: true });
      const { count: hCount } = await supabase
        .from("headers")
        .select("*", { count: "exact", head: true });

      const totalRows =
        (ordersData?.length || 0) +
        (pCount || 0) +
        (vCount || 0) +
        (hCount || 0);
      const estimatedDbMB = (totalRows * 0.1).toFixed(2);

      setStats({
        orders: ordersData?.length || 0,
        outOfStock: outOfStockCount || 0,
        totalRevenue: ordersStats.revenue,
        processingOrders: ordersStats.processing,
        dbSize: estimatedDbMB,
        storageSize: totalMB,
      });

      setRecentOrders(latestOrders || []);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  }

  async function cleanUnusedImages() {
    setIsCleaning(true);
    let totalDeleted = 0;
    try {
      const { data: productsData } = await supabase
        .from("products")
        .select("images");
      const { data: headersData } = await supabase
        .from("headers")
        .select("image_url");

      const extractFileName = (url) => url?.split("/").pop();
      const usedProductImages = new Set();
      productsData?.forEach((p) => {
        p.images?.forEach((url) => usedProductImages.add(extractFileName(url)));
      });

      const usedHeaderImages = new Set();
      headersData?.forEach((h) => {
        usedHeaderImages.add(extractFileName(h.image_url));
      });

      // تنظيف باكت المنتجات
      const { data: pStorageFiles } = await supabase.storage
        .from("product-images")
        .list();
      const pUnused = pStorageFiles
        ?.filter(
          (f) => !usedProductImages.has(f.name) && f.name !== ".emptyKeep",
        )
        .map((f) => f.name);

      if (pUnused?.length > 0) {
        await supabase.storage.from("product-images").remove(pUnused);
        totalDeleted += pUnused.length;
      }

      // تنظيف باكت الهيدرز
      const { data: hStorageFiles } = await supabase.storage
        .from("header-images")
        .list();
      const hUnused = hStorageFiles
        ?.filter(
          (f) => !usedHeaderImages.has(f.name) && f.name !== ".emptyKeep",
        )
        .map((f) => f.name);

      if (hUnused?.length > 0) {
        await supabase.storage.from("header-images").remove(hUnused);
        totalDeleted += hUnused.length;
      }

      if (totalDeleted > 0) {
        alert(`تم بنجاح حذف ${totalDeleted} صورة غير مستخدمة.`);
        fetchDashboardData();
      } else {
        alert("لا يوجد صور غير مستخدمة لحذفها.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء التنظيف: " + err.message);
    } finally {
      setIsCleaning(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center font-black animate-pulse text-2xl italic tracking-widest text-black">
          HAYA STORE ANALYTICS...
        </div>
      </div>
    );

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      {/* Header */}
      <header className="mb-10 border-b-[6px] border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            لوحة التحكم
          </h1>
          <p className="font-bold text-gray-400 text-sm uppercase">
            Supabase Database Infrastructure Monitoring
          </p>
        </div>
        <button
          onClick={cleanUnusedImages}
          disabled={isCleaning}
          className={`border-[3px] border-black p-3 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 ${isCleaning ? "bg-gray-200" : "bg-red-500 text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"}`}
        >
          <FiTrash2 /> {isCleaning ? "جاري الفحص..." : "تنظيف مخزن الصور"}
        </button>
      </header>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <UsageCard
          title="قاعدة البيانات"
          current={stats.dbSize}
          max={500}
          unit="MB"
          icon={<FiDatabase />}
          color="bg-purple-400"
        />
        <UsageCard
          title="الملفات و الصور"
          current={stats.storageSize}
          max={1024}
          unit="MB"
          icon={<FiHardDrive />}
          color="bg-orange-400"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="إجمالي الأرباح"
          value={`${stats.totalRevenue} LE`}
          icon={<FiTrendingUp />}
          color="bg-green-400"
        />
        <StatCard
          title="طلبات للتجهيز"
          value={stats.processingOrders}
          icon={<FiTruck />}
          color="bg-blue-400"
        />
        <StatCard
          title="منتجات نفدت"
          value={stats.outOfStock}
          icon={<FiAlertTriangle />}
          color="bg-yellow-400"
        />
        <StatCard
          title="عدد العمليات"
          value={stats.orders}
          icon={<FiShoppingCart />}
          color="bg-white"
        />
      </div>

      {/* Table */}
      <div className="border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
        <div className="bg-black text-white p-4 font-black flex justify-between items-center italic uppercase text-sm">
          <span>سجل النشاط الأخير</span>
          <FiBox />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-100 border-b-4 border-black font-black text-xs uppercase">
              <tr>
                <th className="p-4 border-l-2 border-black">كود الطلب</th>
                <th className="p-4 border-l-2 border-black">العميل</th>
                <th className="p-4">القيمة</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b-2 border-black font-bold hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">#{order.order_number}</td>
                  <td className="p-4 italic text-gray-600">
                    {order.customer_name}
                  </td>
                  <td className="p-4 font-black">{order.total_amount} LE</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`${color} border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-32`}
    >
      <div className="flex justify-between items-start text-3xl font-black">
        <span>{value}</span>
        <span className="border-2 border-black p-1 bg-white">{icon}</span>
      </div>
      <p className="font-black text-[10px] uppercase underline">{title}</p>
    </div>
  );
}

function UsageCard({ title, current, max, unit, icon, color }) {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
      <div className="flex justify-between items-center mb-4 font-black italic">
        <h3 className="text-xl flex items-center gap-2 uppercase">
          {icon} {title}
        </h3>
        <span className="text-sm">
          {current} / {max} {unit}
        </span>
      </div>
      <div className="w-full h-8 border-[3px] border-black bg-gray-100 p-1 relative overflow-hidden">
        <div
          className={`h-full border-r-[3px] border-black ${color} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        ></div>
        <span className="absolute inset-0 flex items-center justify-center font-black text-xs mix-blend-difference text-white">
          {percentage.toFixed(1)}% USED
        </span>
      </div>
    </div>
  );
}
