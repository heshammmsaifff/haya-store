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
  FiUploadCloud,
  FiImage,
} from "react-icons/fi";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

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

  // دالة الرفع الموحدة (تستخدم للإضافة وللتعديل)
  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publicUrl = null;
      if (imageFile) {
        publicUrl = await uploadImage(imageFile);
      }
      const { error } = await supabase
        .from("categories")
        .insert([{ name: name, image_url: publicUrl }]);

      if (error) throw error;

      alert("تم إضافة الفئة بنجاح! 🏷️");
      setName("");
      setImageFile(null);
      fetchCategories();
    } catch (error) {
      alert("خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setImageFile(null); // تصفير أي ملف مختار سابقاً عند بدء تعديل جديد
  };

  const saveEdit = async (id, oldImageUrl) => {
    setLoading(true);
    try {
      let finalImageUrl = oldImageUrl;

      // إذا اختار المستخدم صورة جديدة أثناء التعديل
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);

        // حذف الصورة القديمة من السيرفر لتوفير المساحة
        if (oldImageUrl) {
          const path = oldImageUrl.split("product-images/")[1];
          await supabase.storage.from("product-images").remove([path]);
        }
      }

      const { error } = await supabase
        .from("categories")
        .update({
          name: editName,
          image_url: finalImageUrl,
        })
        .eq("id", id);

      if (error) throw error;

      setEditingId(null);
      setImageFile(null);
      fetchCategories();
    } catch (error) {
      alert("خطأ في التحديث: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id, imageUrl) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) alert("خطأ في الحذف: " + error.message);
      else {
        if (imageUrl) {
          const path = imageUrl.split("product-images/")[1];
          await supabase.storage.from("product-images").remove([path]);
        }
        fetchCategories();
      }
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
            <div className="space-y-6">
              <div>
                <label className="font-black block text-sm uppercase mb-2">
                  اسم الفئة
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label className="font-black block text-sm uppercase mb-2">
                  صورة الفئة
                </label>
                <div className="relative group border-4 border-dashed border-black p-4 text-center hover:bg-gray-50 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imageFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                      <FiCheck /> {imageFile.name}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <FiUploadCloud size={30} />
                      <span className="text-xs font-bold">اضغط لرفع صورة</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                disabled={loading}
                className="w-full bg-black text-white py-4 font-black hover:bg-yellow-400 hover:text-black transition-all border-2 border-black disabled:bg-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              >
                {loading ? "جاري المعالجة..." : "حفظ الفئة الآن"}
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
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 p-3 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* معاينة الصورة */}
                <div className="w-16 h-16 border-2 border-black overflow-hidden bg-gray-100 flex-shrink-0">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiImage />
                    </div>
                  )}
                </div>

                {/* الاسم أو حقل التعديل */}
                <div className="flex-1">
                  {editingId === cat.id ? (
                    <div className="space-y-2">
                      <input
                        className="border-2 border-black p-1 w-full font-bold shadow-inner"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      {/* حقل تغيير الصورة أثناء التعديل */}
                      <div className="relative border-2 border-dashed border-black p-1 text-center bg-gray-50 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold flex items-center justify-center gap-1">
                          {imageFile ? (
                            <>
                              <FiCheck className="text-green-600" /> جاهز للرفع
                            </>
                          ) : (
                            <>
                              <FiUploadCloud /> تغيير الصورة؟
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-lg font-black">{cat.name}</span>
                  )}
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-2">
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat.id, cat.image_url)}
                        disabled={loading}
                        className="p-2 border-2 border-black bg-green-400 hover:bg-green-500 disabled:bg-gray-300"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setImageFile(null);
                        }}
                        className="p-2 border-2 border-black bg-gray-200"
                      >
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 border-2 border-black bg-blue-400 hover:bg-blue-500"
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.image_url)}
                        className="p-2 border-2 border-black bg-red-400 hover:bg-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
