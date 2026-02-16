"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiPlus,
  FiTrash2,
  FiCamera,
  FiX,
  FiTag,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
} from "react-icons/fi";

// دالة مساعدة لتحديد لون النص (أسود أو أبيض) بناءً على لون الخلفية
function getContrastColor(hexcolor) {
  if (!hexcolor) return "black";
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [imagesData, setImagesData] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [productsBySub, setProductsBySub] = useState({});
  const [expandedSub, setExpandedSub] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    material: "",
    care_instructions: "",
    base_price: "",
    discount_type: "none",
    discount_value: 0,
    sub_category_id: "",
  });

  const [variants, setVariants] = useState([
    { color: "", size: "M", stock: 1 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: subs } = await supabase
      .from("sub_categories")
      .select("id, name");
    setSubCategories(subs || []);

    const { data: prods } = await supabase
      .from("products")
      .select("*, sub_categories(name)");
    const grouped = prods?.reduce((acc, curr) => {
      if (!acc[curr.sub_category_id]) acc[curr.sub_category_id] = [];
      acc[curr.sub_category_id].push(curr);
      return acc;
    }, {});
    setProductsBySub(grouped || {});
  }

  // بدلاً من الاعتماد على imagesData فقط، اعتمد على الألوان المدخلة فعلياً في الصور
  const activeColors = Array.from(
    new Set(imagesData.map((img) => img.color)),
  ).filter(Boolean);

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.base_price) || 0;
    const val = parseFloat(formData.discount_value) || 0;
    if (formData.discount_type === "percentage")
      return price - (price * val) / 100;
    if (formData.discount_type === "fixed") return price - val;
    return price;
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob), "image/webp", 0.6);
        };
      };
    });
  };

  const uploadImagesAndGetUrls = async () => {
    const uploadedUrls = [];
    for (const item of imagesData) {
      if (typeof item.file === "string" && item.file.startsWith("http")) {
        uploadedUrls.push(item.file);
        continue;
      }
      const compressedBlob = await compressImage(item.file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const { data } = await supabase.storage
        .from("product-images")
        .upload(fileName, compressedBlob);
      if (data) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }
    return uploadedUrls;
  };

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا الموديل؟")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) alert("خطأ في الحذف");
      else fetchData(); // إعادة تحديث البيانات بعد الحذف
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.sub_category_id) return alert("اختر الفئة");
    setLoading(true);
    try {
      const imageUrls = await uploadImagesAndGetUrls();
      let productId = editingId;

      // داخل handleSave قبل الـ update
      const productPayload = {
        name: formData.name,
        description: formData.description,
        material: formData.material,
        care_instructions: formData.care_instructions,
        base_price: parseFloat(formData.base_price),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        sub_category_id: formData.sub_category_id,
        images: imageUrls,
      };

      if (editingId) {
        await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editingId);
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", editingId);
      } else {
        const code = `HS-${Math.floor(10000 + Math.random() * 90000)}`;
        const { data: product, error } = await supabase
          .from("products")
          .insert([{ ...productPayload, code }])
          .select()
          .single();
        if (error) throw error;
        productId = product.id;
      }

      const variantsToInsert = variants.map((v) => ({
        product_id: productId,
        color: v.color,
        size: v.size,
        stock: parseInt(v.stock) || 0,
        is_available: parseInt(v.stock) > 0,
      }));
      await supabase.from("product_variants").insert(variantsToInsert);

      alert("تم الحفظ بنجاح!");
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      material: "",
      care_instructions: "",
      base_price: "",
      discount_type: "none",
      discount_value: 0,
      sub_category_id: "",
    });
    setImagesData([]);
    setVariants([{ color: "", size: "M", stock: 1 }]);
  };

  const startEdit = async (prod) => {
    setEditingId(prod.id);

    // 1. تنظيف البيانات الأساسية
    const { sub_categories, ...cleanData } = prod;
    setFormData(cleanData);

    // 2. جلب المتغيرات (المقاسات والألوان) أولاً
    const { data: vData, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", prod.id);

    if (error) {
      console.error("Error fetching variants:", error);
      return;
    }

    // 3. استخراج الألوان الفريدة من المتغيرات
    // هذا سيجعل activeColors تحتوي على الألوان الصحيحة فوراً
    const uniqueColorsFromVariants = Array.from(
      new Set(vData.map((v) => v.color)),
    );

    // 4. تحديث الصور
    // سنقوم بتوزيع الألوان الموجودة على الصور المتاحة
    const mappedImages = prod.images.map((url, index) => ({
      file: url,
      preview: url,
      // إذا كان لدينا ألوان من المتغيرات، نربطها بالصور بالترتيب، وإلا نضع أسود
      color:
        uniqueColorsFromVariants[index] ||
        uniqueColorsFromVariants[0] ||
        "#000000",
    }));

    setImagesData(mappedImages);
    setVariants(vData || []);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <h1 className="text-3xl font-black mb-8 border-b-4 border-black pb-4 flex justify-between italic">
        <span>HAYA STORE | {editingId ? "تعديل موديل" : "إضافة موديل"}</span>
        {editingId && (
          <button
            onClick={resetForm}
            className="text-sm bg-red-500 text-white px-4 py-1 rounded border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            إلغاء التعديل
          </button>
        )}
      </h1>

      <form onSubmit={handleSave} className="space-y-10 mb-20">
        {/* 1. الصور والألوان */}
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-bold mb-6 text-xl flex items-center gap-2">
            <FiCamera /> 1. صور الألوان
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {imagesData.map((img, i) => (
              <div
                key={i}
                className="relative border-2 border-black rounded-lg p-1 bg-white"
              >
                <img
                  src={img.preview}
                  className="aspect-[3/4] object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImagesData(imagesData.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full p-1 border-2 border-black shadow-md"
                >
                  <FiX />
                </button>
                <div className="flex items-center gap-2 mt-2 bg-gray-100 p-1 rounded">
                  <input
                    type="color"
                    className="w-8 h-8 border-2 border-black rounded cursor-pointer"
                    value={img.color || "#000000"}
                    onChange={(e) => {
                      const n = [...imagesData];
                      n[i].color = e.target.value;
                      setImagesData(n);
                    }}
                  />
                  <span className="text-[10px] font-black uppercase font-mono">
                    {img.color || "#000"}
                  </span>
                </div>
              </div>
            ))}
            <label className="border-4 border-dashed border-black rounded-lg flex flex-col items-center justify-center cursor-pointer aspect-[3/4] hover:bg-yellow-100 transition-colors">
              <FiPlus size={30} />
              <span className="font-bold text-sm">صورة جديدة</span>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setImagesData([
                    ...imagesData,
                    ...Array.from(e.target.files).map((f) => ({
                      file: f,
                      preview: URL.createObjectURL(f),
                      color: "",
                    })),
                  ])
                }
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
        </div>

        {/* 2. البيانات والأسعار */}
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-bold mb-6 text-xl flex items-center gap-2">
            <FiTag /> 2. البيانات والأسعار
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">الفئة الفرعية</label>
              <select
                required
                className="border-2 border-black p-2 rounded-lg font-bold bg-white"
                value={formData.sub_category_id}
                onChange={(e) =>
                  setFormData({ ...formData, sub_category_id: e.target.value })
                }
              >
                <option value="">-- اختر --</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="اسم الموديل"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
            />
            <Input
              label="السعر الأصلي (EGP)"
              type="number"
              value={formData.base_price}
              onChange={(v) => setFormData({ ...formData, base_price: v })}
            />
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-yellow-100 p-4 border-2 border-black rounded-lg">
              <div>
                <label className="font-black text-xs block mb-1">
                  نوع الخصم
                </label>
                <div className="flex gap-2">
                  {["none", "percentage", "fixed"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          discount_type: type,
                          discount_value: 0,
                        })
                      }
                      className={`flex-1 py-2 border-2 border-black font-bold text-xs rounded transition-all ${formData.discount_type === type ? "bg-black text-white shadow-none" : "bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"}`}
                    >
                      {type === "none"
                        ? "بدون"
                        : type === "percentage"
                          ? "%"
                          : "مبلغ"}
                    </button>
                  ))}
                </div>
              </div>
              {formData.discount_type !== "none" && (
                <Input
                  label={
                    formData.discount_type === "percentage"
                      ? "نسبة الخصم %"
                      : "قيمة الخصم (جنية)"
                  }
                  type="number"
                  value={formData.discount_value}
                  onChange={(v) =>
                    setFormData({ ...formData, discount_value: v })
                  }
                />
              )}
              <div className="flex flex-col justify-end">
                <div className="bg-white border-2 border-black p-2 rounded flex justify-between items-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="font-bold text-xs italic text-gray-500">
                    السعر النهائي:
                  </span>
                  <span className="font-black text-xl text-green-600">
                    {calculateFinalPrice()} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. المقاسات والكميات */}
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl underline">
              3. المقاسات والمخزون
            </h3>
            <button
              type="button"
              onClick={() =>
                setVariants([...variants, { color: "", size: "M", stock: 1 }])
              }
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] active:shadow-none transition-all"
            >
              <FiPlus /> إضافة مقاس
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="flex flex-wrap gap-4 items-end bg-white p-4 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                {/* تعديل الـ Select المطلوب */}
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs font-bold block mb-1">
                    اللون المختار
                  </label>
                  <div
                    className="flex items-center gap-2 border-2 border-black p-1 rounded-md transition-all"
                    style={{
                      backgroundColor: v.color ? `${v.color}22` : "#fff",
                    }}
                  >
                    <select
                      required
                      className="flex-1 bg-transparent font-black outline-none cursor-pointer text-sm"
                      value={v.color}
                      onChange={(e) => {
                        const n = [...variants];
                        n[idx].color = e.target.value;
                        setVariants(n);
                      }}
                      style={{ color: v.color || "black" }}
                    >
                      <option value="" className="bg-white text-black">
                        اختر لوناً
                      </option>
                      {activeColors.map((hex) => (
                        <option
                          key={hex}
                          value={hex}
                          style={{
                            backgroundColor: hex,
                            color: getContrastColor(hex),
                          }}
                        >
                          {hex}
                        </option>
                      ))}
                    </select>
                    <div
                      className="w-8 h-8 border-2 border-black rounded shadow-sm flex-shrink-0"
                      style={{ backgroundColor: v.color || "#eee" }}
                    />
                  </div>
                </div>

                <div className="w-24">
                  <label className="text-xs font-bold block mb-1">المقاس</label>
                  <input
                    className="w-full border-2 border-black p-2 rounded font-bold text-center uppercase"
                    value={v.size}
                    onChange={(e) => {
                      const n = [...variants];
                      n[idx].size = e.target.value;
                      setVariants(n);
                    }}
                  />
                </div>

                <div className="w-28">
                  <label className="text-xs font-bold block mb-1">
                    الكمية (Stock)
                  </label>
                  <div className="flex items-center border-2 border-black rounded-md overflow-hidden bg-white">
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2 font-black text-center outline-none"
                      value={v.stock}
                      onChange={(e) => {
                        const n = [...variants];
                        n[idx].stock = e.target.value;
                        setVariants(n);
                      }}
                    />
                    <span className="bg-black text-white text-[10px] px-2 py-3">
                      ق
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setVariants(variants.filter((_, i) => i !== idx))
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <FiTrash2 size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-yellow-400 py-6 rounded-2xl text-2xl font-black border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase italic"
        >
          {loading
            ? "جاري الحفظ..."
            : editingId
              ? "تحديث الموديل"
              : "نشر الموديل الآن"}
        </button>
      </form>
      {/* جدول عرض المنتجات */}
      <div className="mt-20">
        <h2 className="text-2xl font-black mb-6 bg-black text-white inline-block px-6 py-2 skew-x-[-10deg]">
          الموديلات الحالية
        </h2>

        {Object.keys(productsBySub).map((subId) => (
          <div
            key={subId}
            className="mb-10 border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
          >
            {/* رأس الجدول: اسم الفئة */}
            <div className="bg-gray-200 p-4 font-black border-b-2 border-black">
              الفئة: {subCategories.find((s) => s.id == subId)?.name || "عام"}
            </div>

            <table className="w-full text-right bg-white">
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="p-4">الصورة</th>
                  <th className="p-4">الاسم</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {productsBySub[subId].map((prod) => (
                  <tr
                    key={prod.id}
                    className="border-b border-gray-100 hover:bg-yellow-50"
                  >
                    <td className="p-4">
                      <img
                        src={prod.images?.[0]}
                        className="w-12 h-16 object-cover rounded border border-black"
                      />
                    </td>
                    <td className="p-4 font-bold">{prod.name}</td>
                    <td className="p-4 font-mono">{prod.base_price} EGP</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* زر التعديل */}
                        <button
                          onClick={() => startEdit(prod)}
                          className="p-2 bg-blue-500 text-white rounded border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <FiEdit3 />
                        </button>
                        {/* زر الحذف */}
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 bg-red-500 text-white rounded border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-bold text-sm text-right">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-black p-2 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 outline-none transition-all"
      />
    </div>
  );
}
