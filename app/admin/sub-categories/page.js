"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiEdit3,
  FiX,
  FiCheck,
  FiSearch,
} from "react-icons/fi";

export default function AddSubCategoryPage() {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [subName, setSubName] = useState("");
  const [loading, setLoading] = useState(false);

  // حالات التعديل
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMainId, setEditMainId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // 1. جلب الفئات الرئيسية
    const { data: mainData } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });
    setMainCategories(mainData || []);

    // 2. جلب الفئات الفرعية مع بيانات الفئة الرئيسية المرتبطة بها
    const { data: subData } = await supabase
      .from("sub_categories")
      .select(
        `
        id, 
        name, 
        category_id,
        categories (name)
      `,
      )
      .order("created_at", { ascending: false });
    setSubCategories(subData || []);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMain) return alert("برجاء اختيار الفئة الرئيسية أولاً");

    setLoading(true);
    try {
      const { error } = await supabase
        .from("sub_categories")
        .insert([{ name: subName, category_id: selectedMain }]);

      if (error) throw error;

      alert("تم إضافة الفئة الفرعية بنجاح! ✨");
      setSubName("");
      fetchData(); // تحديث القائمة فوراً
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "هل أنت متأكد من حذف هذه الفئة الفرعية؟ سيؤدي ذلك لإزالة ارتباط المنتجات التابعة لها.",
      )
    ) {
      const { error } = await supabase
        .from("sub_categories")
        .delete()
        .eq("id", id);
      if (error) alert("خطأ في الحذف");
      else fetchData();
    }
  };

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditMainId(sub.category_id);
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from("sub_categories")
      .update({ name: editName, category_id: editMainId })
      .eq("id", id);

    if (error) alert("خطأ في التحديث");
    else {
      setEditingId(null);
      fetchData();
    }
  };

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <h1 className="text-4xl font-black mb-8 border-b-8 border-black pb-4 flex items-center gap-3 italic tracking-tighter">
        <FiLayers className="text-yellow-500" /> إدارة الأقسام الفرعية
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* القسم الأيمن: نموذج الإضافة */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleSave}
            className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 sticky top-8"
          >
            <h2 className="text-xl font-black border-b-2 border-black pb-2 mb-4">
              إضافة قسم جديد
            </h2>

            <div>
              <label className="font-black block mb-2 text-sm uppercase">
                1. الفئة الرئيسية
              </label>
              <select
                required
                value={selectedMain}
                onChange={(e) => setSelectedMain(e.target.value)}
                className="w-full border-4 border-black p-3 font-bold bg-yellow-50 outline-none focus:ring-0"
              >
                <option value="">-- اختر الفئة --</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-black block mb-2 text-sm uppercase">
                2. اسم القسم الفرعي
              </label>
              <input
                required
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <button
              disabled={loading}
              className={`w-full py-4 font-black text-lg border-4 border-black transition-all flex items-center justify-center gap-2
                ${loading ? "bg-gray-200" : "bg-black text-white hover:bg-yellow-400 hover:text-black active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}`}
            >
              {loading ? "جاري الحفظ..." : "تأكيد الإضافة"}
              {!loading && <FiCheckCircle />}
            </button>
          </form>
        </div>

        {/* القسم الأيسر: عرض الأقسام الحالية */}
        <div className="lg:col-span-8">
          <div className="bg-black text-white p-4 flex justify-between items-center border-4 border-black mb-6 shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]">
            <h2 className="text-xl font-black italic flex items-center gap-2">
              <FiSearch /> الأقسام الحالية ({subCategories.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subCategories.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-1 transition-transform"
              >
                {editingId === sub.id ? (
                  <div className="space-y-3">
                    <select
                      className="w-full border-2 border-black p-1 text-sm font-bold"
                      value={editMainId}
                      onChange={(e) => setEditMainId(e.target.value)}
                    >
                      {mainCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="w-full border-2 border-black p-1 text-sm font-black"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(sub.id)}
                        className="flex-1 bg-green-500 text-white p-1 border-2 border-black font-bold"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-500 text-white p-1 border-2 border-black font-bold"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 inline-block bg-yellow-400 text-[10px] font-black px-2 py-1 border border-black uppercase">
                      {sub.categories?.name || "عام"}
                    </div>
                    <h3 className="text-2xl font-black truncate">{sub.name}</h3>

                    <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(sub)}
                        className="p-2 bg-blue-500 text-white border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                      >
                        <FiEdit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 bg-red-500 text-white border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {subCategories.length === 0 && (
            <div className="text-center py-20 border-4 border-dashed border-gray-300">
              <p className="text-gray-400 font-bold">
                لا توجد أقسام فرعية مضافة بعد.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
