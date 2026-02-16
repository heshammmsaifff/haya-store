import Sidebar from "@/components/Sidebar"; // تأكد من المسار الصحيح

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white font-sans" dir="rtl">
      {/* الـ Sidebar ثابت على اليمين */}
      <Sidebar />

      {/* المحتوى المتغير على اليسار */}
      <main className="flex-1 overflow-y-auto bg-gray-50 border-r-[2px] border-black">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
