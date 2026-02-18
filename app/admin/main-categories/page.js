"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiPlus,
  FiGrid,
  FiTrash2,
  FiEdit3,
  FiX,
  FiCheck,
} from "react-icons/fi";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCategories(data);
    if (error) console.error("Error fetching:", error);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("categories")
        .insert([{ name: name }]);

      if (error) throw error;

      alert("تم إضافة الفئة الرئيسية بنجاح! 🏷️");
      setName("");
      fetchCategories(); // تحديث القائمة
    } catch (error) {
      alert("خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (
      confirm(
        "هل أنت متأكد من حذف هذه الفئة؟ قد يؤثر ذلك على الأقسام الفرعية المرتبطة بها.",
      )
    ) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) alert("خطأ في الحذف: " + error.message);
      else fetchCategories();
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from("categories")
      .update({ name: editName })
      .eq("id", id);

    if (error) alert("خطأ في التحديث");
    else {
      setEditingId(null);
      fetchCategories();
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-right text-black" dir="rtl">
      <h1 className="text-4xl font-black mb-10 border-b-8 border-black pb-4 flex items-center gap-3 italic uppercase">
        <FiGrid /> إدارة الفئات الرئيسية
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* قسم الإضافة */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiPlus className="bg-yellow-400 p-1 border-2 border-black" /> إضافة
            فئة جديدة
          </h2>
          <form
            onSubmit={handleSave}
            className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="space-y-4">
              <label className="font-black block text-sm uppercase tracking-widest">
                اسم الفئة
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-4 border-black p-4 rounded-none font-bold outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
              <button
                disabled={loading}
                className="w-full bg-black text-white py-4 font-black hover:bg-yellow-400 hover:text-black transition-all border-2 border-black disabled:bg-gray-400 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              >
                {loading ? "جاري الحفظ..." : "حفظ الفئة الآن"}
              </button>
            </div>
          </form>
        </div>

        {/* قسم العرض */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            الفئات الحالية ({categories.length})
          </h2>
          <div className="space-y-4">
            {categories.length === 0 && (
              <p className="text-gray-500 italic">لا توجد فئات مضافة بعد...</p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-colors"
              >
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      className="border-2 border-black p-1 flex-1 font-bold"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="text-green-600 p-2 border-2 border-black hover:bg-green-100"
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-red-600 p-2 border-2 border-black hover:bg-red-100"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xl font-black">{cat.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 border-2 border-black bg-blue-400 hover:bg-blue-500 transition-colors"
                        title="تعديل"
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 border-2 border-black bg-red-400 hover:bg-red-500 transition-colors"
                        title="حذف"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
