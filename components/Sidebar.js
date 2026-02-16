"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiShoppingBag,
  FiLayers,
  FiTag,
  FiLayout,
  FiChevronLeft,
  FiPackage,
} from "react-icons/fi";

const Sidebar = () => {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = React.useState("");

  React.useEffect(() => {
    // تحديث الوقت فوراً ثم كل ثانية
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { name: "الإحصائيات", path: "/admin/dashboard", icon: <FiGrid /> },
    {
      name: "إدارة الطلبات",
      path: "/admin/manage-orders-page",
      icon: <FiShoppingBag />,
    },
    { name: "المنتجات", path: "/admin/products", icon: <FiPackage /> },
    {
      name: "الأقسام الرئيسية",
      path: "/admin/main-categories",
      icon: <FiLayers />,
    },
    { name: "الأقسام الفرعية", path: "/admin/sub-categories", icon: <FiTag /> },
    { name: "واجهة الموقع", path: "/admin/manage-header", icon: <FiLayout /> },
  ];

  return (
    <div
      className="w-72 bg-white h-screen sticky top-0 border-l-[6px] border-black p-6 flex flex-col justify-between overflow-y-auto"
      dir="rtl"
    >
      <div>
        {/* Logo Section */}
        <div className="mb-12 border-[4px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-yellow-400 text-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            Haya Store
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest border-t-2 border-black mt-1">
            Admin Panel
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`
                  flex items-center gap-4 p-4 font-black transition-all border-[3px] 
                  ${
                    isActive
                      ? "bg-black text-white shadow-none translate-x-[-4px] translate-y-[4px]"
                      : "bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[-2px] hover:translate-y-[2px]"
                  }
                `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-lg">{item.name}</span>
                  {isActive && (
                    <FiChevronLeft className="mr-auto text-yellow-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="mt-10 border-t-4 border-black pt-4 font-bold text-[11px] text-gray-600 space-y-1 bg-gray-50 p-2 border-2 border-dashed border-black">
        <p className="uppercase tracking-widest text-black flex justify-between">
          <span>System Status:</span>
          <span className="text-green-600 animate-pulse">● Live</span>
        </p>
        <p className="italic leading-relaxed">
          {currentTime || "جاري التحميل..."}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
