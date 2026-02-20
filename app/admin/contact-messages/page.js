"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { FiMail, FiTrash2, FiEye, FiClock, FiPhone } from "react-icons/fi";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة هذه الرسالة بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#000",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);
      if (error) {
        Swal.fire("خطأ!", "تعذر حذف الرسالة", "error");
      } else {
        setMessages(messages.filter((msg) => msg.id !== id));
        Swal.fire("تم الحذف!", "تم حذف الرسالة بنجاح.", "success");
      }
    }
  };

  const showMessage = (msg) => {
    Swal.fire({
      title: `<span class="text-lg font-bold">${msg.subject || "بدون عنوان"}</span>`,
      html: `
        <div dir='rtl' class="text-right flex flex-col gap-3 font-sans">
          <p><strong>من:</strong> ${msg.name}</p>
          <p><strong>الهاتف:</strong> <a href="tel:${msg.phone}" class="text-blue-600">${msg.phone}</a></p>
          <p><strong>الإيميل:</strong> ${msg.email || "غير متوفر"}</p>
          <hr/>
          <p class="leading-relaxed bg-gray-50 p-4 rounded text-gray-700">${msg.message}</p>
        </div>
      `,
      confirmButtonText: "إغلاق",
      confirmButtonColor: "#000",
      customClass: { popup: "rounded-none" },
    });
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">رسائل التواصل</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة الرسائل الواردة</p>
        </div>
        <div className="bg-black text-white px-4 py-2 text-sm font-bold">
          {messages.length} رسالة
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : messages.length > 0 ? (
        <div className="overflow-x-auto shadow-sm border border-gray-100">
          <table className="w-full text-right bg-white">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-widest border-b">
                <th className="px-6 py-4">المرسل</th>
                <th className="px-6 py-4">التواصل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-black">{msg.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <FiPhone size={10} /> {msg.phone}
                      </span>
                      {msg.email && (
                        <span className="text-[10px] text-gray-400 italic">
                          {msg.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(msg.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => showMessage(msg)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <FiMail className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold">لا توجد رسائل جديدة</p>
        </div>
      )}
    </div>
  );
}
