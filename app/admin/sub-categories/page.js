"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FiLayers, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function AddSubCategoryPage() {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [subName, setSubName] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. جلب الفئات الرئيسية عشان نختار منها
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setMainCategories(data || []);
      }
    }
    fetchCategories();
  }, []);

  // 2. دالة الحفظ (بدون slug)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMain) {
      alert("برجاء اختيار الفئة الرئيسية أولاً");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("sub_categories").insert([
        {
          name: subName,
          category_id: selectedMain,
        },
      ]);

      if (error) throw error;

      alert("تم إضافة الفئة الفرعية بنجاح! ✨");
      setSubName(""); // مسح الخانة بعد الحفظ
    } catch (error) {
      console.error("Detailed Error:", error);
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <h1 className="text-3xl font-black mb-8 border-b-4 border-black pb-4 flex items-center gap-3">
        <FiLayers className="text-yellow-500" /> إضافة فئة فرعية
      </h1>

      <div className="max-w-xl">
        <form
          onSubmit={handleSave}
          className="bg-gray-50 p-8 rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6"
        >
          {/* اختيار الفئة الرئيسية */}
          <div>
            <label className="font-black block mb-2 text-lg">
              1. اختار الفئة الرئيسية
            </label>
            <select
              required
              value={selectedMain}
              onChange={(e) => setSelectedMain(e.target.value)}
              className="w-full border-2 border-black p-4 rounded-xl font-bold bg-white outline-none focus:ring-4 ring-yellow-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <option value="">-- اضغط للاختيار --</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* اسم الفئة الفرعية */}
          <div>
            <label className="font-black block mb-2 text-lg">
              2. اسم الفئة الفرعية
            </label>
            <input
              required
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="w-full border-2 border-black p-4 rounded-xl font-bold outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              placeholder="مثال: فساتين سواريه، طرح شيفون..."
            />
          </div>

          {/* زر الحفظ */}
          <button
            disabled={loading}
            className={`w-full py-5 rounded-xl font-black text-xl border-2 border-black transition-all flex items-center justify-center gap-2
              ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
              }`}
          >
            {loading ? "جاري الحفظ الآن..." : "إضافة الفئة الفرعية"}
            {!loading && <FiCheckCircle />}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl flex items-start gap-3 text-blue-800">
          <FiAlertCircle className="mt-1 flex-shrink-0" />
          <p className="text-sm font-bold">
            تأكد أن الفئات الفرعية مرتبطة دائماً بفئة رئيسية لتسهيل عملية البحث
            على العميل في متجر **Haya Store**.
          </p>
        </div>
      </div>
    </div>
  );
}
