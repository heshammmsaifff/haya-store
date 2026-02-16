"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiLink,
  FiEye,
  FiEyeOff,
  FiEdit3,
  FiXCircle,
} from "react-icons/fi";

export default function ManageHeaderPage() {
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null); // لتحديد ما إذا كنا في وضع التعديل
  const [formData, setFormData] = useState({
    title: "",
    link_url: "",
    display_order: 0,
  });

  const MAX_HEADERS = 3;

  useEffect(() => {
    fetchHeaders();
  }, []);

  async function fetchHeaders() {
    const { data } = await supabase
      .from("headers")
      .select("*")
      .order("display_order", { ascending: true });
    setHeaders(data || []);
  }

  const processImage = async (inputFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(inputFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 1920;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob), "image/webp", 0.8);
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // منع الإضافة إذا وصلنا للحد الأقصى (فقط في حالة الإضافة الجديدة)
    if (!editingId && headers.length >= MAX_HEADERS) {
      return alert(`عذراً، الحد الأقصى هو ${MAX_HEADERS} صور فقط.`);
    }

    setLoading(true);
    try {
      let finalImageUrl = preview;

      // 1. معالجة الصورة إذا تم اختيار ملف جديد
      if (file) {
        const webpBlob = await processImage(file);
        const fileName = `header-${Date.now()}.webp`;
        const { error: storageError } = await supabase.storage
          .from("header-images")
          .upload(fileName, webpBlob, { contentType: "image/webp" });
        if (storageError) throw storageError;

        const { data: urlData } = supabase.storage
          .from("header-images")
          .getPublicUrl(fileName);
        finalImageUrl = urlData.publicUrl;
      }

      const payload = {
        title: formData.title,
        link_url: formData.link_url,
        display_order: formData.display_order,
        image_url: finalImageUrl,
      };

      if (editingId) {
        // تحديث بانر موجود
        const { error } = await supabase
          .from("headers")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("تم تحديث البانر بنجاح");
      } else {
        // إضافة بانر جديد
        const { error } = await supabase
          .from("headers")
          .insert([{ ...payload, is_active: true }]);
        if (error) throw error;
        alert("تمت إضافة البانر بنجاح");
      }

      resetForm();
      fetchHeaders();
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFile(null);
    setPreview(null);
    setFormData({ title: "", link_url: "", display_order: 0 });
  };

  const startEdit = (header) => {
    setEditingId(header.id);
    setFormData({
      title: header.title,
      link_url: header.link_url,
      display_order: header.display_order,
    });
    setPreview(header.image_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (id, currentStatus) => {
    await supabase
      .from("headers")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchHeaders();
  };

  const deleteHeader = async (id) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from("headers").delete().eq("id", id);
    fetchHeaders();
  };

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <header className="mb-10 border-b-[6px] border-black pb-4 flex justify-between items-end">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          إدارة الـ Header
        </h1>
        <span className="font-black text-xl bg-black text-white px-4 py-1">
          {headers.length} / {MAX_HEADERS}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* فورم الإضافة والتعديل */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-1 space-y-6 bg-white p-6 border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sticky top-8 h-fit"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              {editingId ? (
                <>
                  <FiEdit3 strokeWidth={3} /> تعديل البانر
                </>
              ) : (
                <>
                  <FiPlus strokeWidth={3} /> إضافة بانر
                </>
              )}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-red-600 font-black flex items-center gap-1 text-sm underline"
              >
                <FiXCircle /> إلغاء التعديل
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-black text-sm mb-2 uppercase">
                صورة البانر
              </label>
              <label className="border-[3px] border-dashed border-black p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-400 transition-all h-48 overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {preview ? (
                  <img
                    src={preview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <>
                    <FiUploadCloud size={40} strokeWidth={3} />
                    <span className="text-sm mt-2 font-black">
                      اسحب الصورة هنا
                    </span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      setFile(f);
                      setPreview(URL.createObjectURL(f));
                    }
                  }}
                  accept="image/*"
                />
              </label>
            </div>

            <Input
              label="العنوان الرئيسي"
              value={formData.title}
              onChange={(v) => setFormData({ ...formData, title: v })}
            />
            <Input
              label="رابط التوجيه (URL)"
              placeholder="/shop/now"
              value={formData.link_url}
              onChange={(v) => setFormData({ ...formData, link_url: v })}
            />
            <Input
              label="ترتيب الظهور"
              type="number"
              value={formData.display_order}
              onChange={(v) => setFormData({ ...formData, display_order: v })}
            />
          </div>

          <button
            disabled={loading || (!editingId && headers.length >= MAX_HEADERS)}
            className={`w-full py-4 font-black text-xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase 
            ${editingId ? "bg-blue-400" : headers.length >= MAX_HEADERS ? "bg-gray-300 opacity-50" : "bg-green-400"}`}
          >
            {loading
              ? "جاري المعالجة..."
              : editingId
                ? "تحديث البيانات"
                : "تأكيد الرفع"}
          </button>
        </form>

        {/* قائمة الصور */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black mb-6 italic underline">
            البانرات المفعلة حالياً
          </h2>
          <div className="grid gap-6">
            {headers.map((header) => (
              <div
                key={header.id}
                className={`group flex flex-col md:flex-row gap-6 bg-white border-[3px] border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform ${editingId === header.id ? "scale-[1.02] border-blue-500 shadow-[8px_8px_0px_0px_#3b82f6]" : ""}`}
              >
                <div className="w-full md:w-64 h-36 border-[2px] border-black bg-black overflow-hidden relative">
                  <img
                    src={header.image_url}
                    className="w-full h-full object-cover"
                    alt="Header"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-2xl uppercase leading-none">
                      {header.title || "بدون عنوان"}
                    </h3>
                    <div className="flex items-center gap-2 text-black font-bold mt-2">
                      <FiLink strokeWidth={3} />{" "}
                      <span className="underline">
                        {header.link_url || "لا يوجد"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => toggleStatus(header.id, header.is_active)}
                      className={`flex items-center gap-2 px-4 py-2 font-black border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${header.is_active ? "bg-yellow-400" : "bg-red-500 text-white"}`}
                    >
                      {header.is_active ? (
                        <>
                          <FiEye strokeWidth={3} /> نشط
                        </>
                      ) : (
                        <>
                          <FiEyeOff strokeWidth={3} /> مخفي
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(header)}
                      className="flex items-center gap-2 px-4 py-2 font-black border-[2px] border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all"
                    >
                      <FiEdit3 strokeWidth={3} /> تعديل
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => deleteHeader(header.id)}
                  className="p-4 bg-white hover:bg-red-600 hover:text-white border-[2px] border-black transition-colors self-start shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <FiTrash2 size={24} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون المدخلات الموحد (Input)
function Input({ label, type = "text", value, onChange, placeholder = "" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-black text-sm uppercase">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-[3px] border-black p-3 font-black text-lg outline-none focus:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      />
    </div>
  );
}
