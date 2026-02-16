"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FiPlus, FiGrid } from "react-icons/fi";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: name }]);

      if (error) {
        console.error("Supabase Error:", error.message, error.details);
        throw error;
      }

      alert("تم إضافة الفئة الرئيسية بنجاح! 🏷️");
      setName("");
    } catch (error) {
      alert("خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-right text-black" dir="rtl">
      <h1 className="text-3xl font-black mb-8 border-b-4 border-black pb-4 flex items-center gap-2">
        <FiGrid /> إضافة فئة رئيسية
      </h1>

      <form
        onSubmit={handleSave}
        className="max-w-md bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-4">
          <label className="font-bold block">اسم الفئة</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-black p-3 rounded-lg font-bold outline-none focus:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            placeholder="اكتب الاسم هنا..."
          />
          <button
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg font-black hover:bg-yellow-400 hover:text-black transition-all border-2 border-black disabled:bg-gray-400"
          >
            {loading ? "جاري الحفظ..." : "حفظ الفئة"}
          </button>
        </div>
      </form>
    </div>
  );
}
