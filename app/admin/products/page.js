"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiPlus,
  FiTrash2,
  FiCamera,
  FiX,
  FiTag,
  FiEdit3,
  FiImage,
} from "react-icons/fi";

const TRENDING_COLORS = [
  { name: "أسود", value: "Black", hex: "#000000" },
  { name: "أبيض", value: "White", hex: "#FFFFFF" },
  { name: "أوف وايت", value: "Off-White", hex: "#F5F5DC" },
  { name: "بيج / نود", value: "Beige", hex: "#D2B48C" },
  { name: "كشمير", value: "Cashmere", hex: "#D4A5A5" },
  { name: "موف / لافندر", value: "Lavender", hex: "#E6E6FA" },
  { name: "كحلي", value: "Navy Blue", hex: "#000080" },
  { name: "سماوي", hex: "#87CEEB", value: "Sky Blue" },
  { name: "زيتي", value: "Olive Green", hex: "#556B2F" },
  { name: "مينت جرين", value: "Mint Green", hex: "#98FF98" },
  { name: "رمادي", value: "Grey", hex: "#808080" },
  { name: "فوشيا", value: "Fuchsia", hex: "#FF00FF" },
  { name: "أحمر زاهي", value: "Bright Red", hex: "#FF0000" },
  { name: "نبيتي", value: "Burgundy", hex: "#800000" },
  { name: "مستردة", value: "Mustard", hex: "#FFDB58" },
  { name: "بني شيكولاتة", value: "Chocolate Brown", hex: "#3E1B0F" },
  { name: "مرجاني (كورال)", value: "Coral", hex: "#FF7F50" },
  { name: "بستاج", value: "Pistachio", hex: "#93C572" },
  { name: "تراكوتا", value: "Terracotta", hex: "#E2725B" },
  { name: "ليلكي", value: "Lilac", hex: "#C8A2C8" },
];

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [colorGroups, setColorGroups] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [productsBySub, setProductsBySub] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [variants, setVariants] = useState([
    { color: "", color_code: "", size: "M", is_available: true },
  ]);

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
      const catId = curr.sub_category_id || "unassigned";
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(curr);
      return acc;
    }, {});
    setProductsBySub(grouped || {});
  }

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
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), "image/webp", 0.7);
        };
      };
    });
  };

  const handleEdit = async (product) => {
    setEditingId(product.id);
    setLoading(true);

    try {
      // 1. جلب المقاسات
      const { data: dbVariants } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", product.id);

      // 2. تحديث بيانات الفورم
      setFormData({
        name: product.name,
        description: product.description,
        material: product.material,
        care_instructions: product.care_instructions,
        base_price: product.base_price,
        discount_type: product.discount_type,
        discount_value: product.discount_value,
        sub_category_id: product.sub_category_id,
      });

      // 3. معالجة الصور بنظام JSONB (التحكم الكامل)
      if (Array.isArray(product.images)) {
        // التحقق هل البيانات قديمة (Array of strings) أم جديدة (Array of objects)
        const isNewSystem =
          typeof product.images[0] === "object" && product.images[0] !== null;

        if (isNewSystem) {
          setColorGroups(
            product.images.map((group) => ({
              colorName: group.color,
              colorHex: group.colorHex,
              previews: group.urls || [],
              files: group.urls || [],
            })),
          );
        } else {
          // التعامل مع البيانات القديمة لو وجدت
          setColorGroups([
            {
              colorName: "صور سابقة",
              colorHex: "#000000",
              previews: product.images,
              files: product.images,
            },
          ]);
        }
      } else {
        setColorGroups([]);
      }

      // 4. تحديث المقاسات
      if (dbVariants) {
        setVariants(
          dbVariants.map((v) => ({
            color: v.color,
            color_code: v.color_code,
            size: v.size,
            is_available: v.is_available, // بنجيب الحالة من الداتابيز
          })),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.sub_category_id) return alert("الرجاء اختيار الفئة");
    if (colorGroups.length === 0) return alert("الرجاء إضافة لون وصور");

    setLoading(true);

    try {
      const imagesJson = [];

      // معالجة كل مجموعة ألوان على حدة
      for (const group of colorGroups) {
        const uploadedUrls = [];
        for (const file of group.files) {
          // لو الصورة مرفوعة أصلاً (رابط)
          if (typeof file === "string" && file.startsWith("http")) {
            uploadedUrls.push(file);
          } else {
            // لو ملف جديد محتاج ضغط ورفع
            const compressed = await compressImage(file);
            const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
            const { error: uploadError } = await supabase.storage
              .from("product-images")
              .upload(fileName, compressed);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("product-images")
              .getPublicUrl(fileName);
            uploadedUrls.push(urlData.publicUrl);
          }
        }

        imagesJson.push({
          color: group.colorName,
          colorHex: group.colorHex,
          urls: uploadedUrls,
        });
      }

      const productPayload = {
        name: formData.name,
        description: formData.description,
        material: formData.material,
        care_instructions: formData.care_instructions,
        sub_category_id: formData.sub_category_id,
        base_price: parseFloat(formData.base_price) || 0,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        images: imagesJson, // حفظ كـ JSONB
      };

      let productId = editingId;
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
        color_code: v.color_code || "#000000",
        size: v.size || "M",
        is_available: v.is_available, // بنرفع الحالة مباشرة
        stock: v.is_available ? 99 : 0, // "حيلة" تقنية: بنحط رقم كبير لو متاح عشان السيستم ميعتبروش خلصان
      }));

      await supabase.from("product_variants").insert(variantsToInsert);

      alert("تم الحفظ بنجاح بنظام التحكم الكامل!");
      resetForm();
      fetchData();
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    } catch (err) {
      alert("خطأ في الحذف");
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
    setColorGroups([]);
    setVariants([{ color: "", color_code: "", size: "M", stock: 1 }]);
  };

  const addColorGroup = () => {
    setColorGroups([
      ...colorGroups,
      { colorName: "", colorHex: "", previews: [], files: [] },
    ]);
  };

  const handleImageUpload = (groupIndex, files) => {
    const newGroups = [...colorGroups];
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    newGroups[groupIndex].files = [...newGroups[groupIndex].files, ...newFiles];
    newGroups[groupIndex].previews = [
      ...newGroups[groupIndex].previews,
      ...newPreviews,
    ];
    setColorGroups(newGroups);
  };

  return (
    <div
      className="p-8 bg-white min-h-screen text-right text-black font-sans"
      dir="rtl"
    >
      <header className="mb-10 border-b-8 border-black pb-6">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          HAYA ADMIN
        </h1>
        {/* <p className="font-bold text-gray-500 italic">
          نظام التحكم الكامل بالألوان والصور (JSON System)
        </p> */}
      </header>

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        <div className="lg:col-span-6 space-y-8">
          <section className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
              <h3 className="text-xl font-black flex items-center gap-2">
                <FiCamera /> مجموعات الصور والألوان
              </h3>
              <button
                type="button"
                onClick={addColorGroup}
                className="bg-black text-white px-4 py-1 text-sm font-bold flex items-center gap-2"
              >
                <FiPlus /> إضافة لون جديد
              </button>
            </div>

            {colorGroups.map((group, gIdx) => (
              <div
                key={gIdx}
                className="mb-8 p-4 border-2 border-black bg-gray-50 relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setColorGroups(colorGroups.filter((_, i) => i !== gIdx))
                  }
                  className="absolute -top-3 -left-3 bg-red-500 text-white p-1 border-2 border-black"
                >
                  <FiX />
                </button>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-black mb-1">
                      اختر اللون:
                    </label>
                    <select
                      className="w-full border-2 border-black p-2 bg-white font-bold"
                      value={group.colorName} // نستخدم اسم اللون فقط كقيمة مخزنة
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (!selectedValue) return;

                        const selectedColor = TRENDING_COLORS.find(
                          (c) => c.value === selectedValue,
                        );

                        if (selectedColor) {
                          const n = [...colorGroups];
                          n[gIdx].colorName = selectedColor.value;
                          n[gIdx].colorHex = selectedColor.hex;
                          setColorGroups(n);
                        }
                      }}
                    >
                      <option value="">-- اختر --</option>
                      {TRENDING_COLORS.map((c) => (
                        <option key={c.hex} value={c.value}>
                          {" "}
                          {/* جعلنا القيمة هي الـ value فقط */}
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div
                      className="w-full h-10 border-2 border-black shadow-inner"
                      style={{ backgroundColor: group.colorHex }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {group.previews.map((src, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative aspect-square border border-black bg-white"
                    >
                      <img
                        src={src}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const n = [...colorGroups];
                          n[gIdx].previews.splice(pIdx, 1);
                          n[gIdx].files.splice(pIdx, 1);
                          setColorGroups(n);
                        }}
                        className="absolute top-0 right-0 bg-black text-white p-0.5"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:bg-white">
                    <FiImage className="text-gray-400" />
                    <span className="text-[10px] font-bold">رفع صور</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(gIdx, e.target.files)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </section>

          <section className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(253,224,71,1)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">المقاسات والمخزون</h3>
              <button
                type="button"
                onClick={() =>
                  setVariants([
                    ...variants,
                    { color: "", color_code: "", size: "M", stock: 1 },
                  ])
                }
                className="bg-yellow-400 text-black p-1 border-2 border-white"
              >
                <FiPlus />
              </button>
            </div>
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center bg-gray-900 p-2 border border-gray-700"
                >
                  <select
                    className="bg-white text-black p-2 font-bold text-xs w-1/3"
                    value={v.color}
                    onChange={(e) => {
                      const selectedValue = e.target.value; // ستكون "Mint Green"
                      const n = [...variants];
                      n[idx].color = selectedValue;
                      n[idx].color_code = TRENDING_COLORS.find(
                        (c) => c.value === selectedValue,
                      )?.hex;
                      setVariants(n);
                    }}
                  >
                    <option value="">اللون</option>
                    {colorGroups
                      .filter((g) => g.colorName)
                      .map((g) => (
                        <option key={g.colorName} value={g.colorName}>
                          {/* ابحث عن الاسم العربي للعرض فقط */}
                          {TRENDING_COLORS.find((c) => c.value === g.colorName)
                            ?.name || g.colorName}
                        </option>
                      ))}
                  </select>
                  <input
                    placeholder="المقاس"
                    className="bg-white text-black p-2 font-bold text-xs w-1/4"
                    value={v.size}
                    onChange={(e) => {
                      const n = [...variants];
                      n[idx].size = e.target.value;
                      setVariants(n);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const n = [...variants];
                      n[idx].is_available = !n[idx].is_available;
                      setVariants(n);
                    }}
                    className={`p-2 font-bold text-xs w-1/4 border-2 border-black transition-colors ${
                      v.is_available
                        ? "bg-green-400 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {v.is_available ? "متاح" : "غير متاح"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setVariants(variants.filter((_, i) => i !== idx))
                    }
                    className="text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-6 space-y-8">
          <section className="bg-yellow-50 p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black mb-6 underline">
              <FiTag /> معلومات الموديل
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <select
                required
                className="border-4 border-black p-3 font-bold bg-white"
                value={formData.sub_category_id}
                onChange={(e) =>
                  setFormData({ ...formData, sub_category_id: e.target.value })
                }
              >
                <option value="">-- اختر الفئة --</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <Input
                label="اسم الموديل"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />
              <textarea
                rows="3"
                className="border-4 border-black p-3 font-bold bg-white"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="الوصف..."
              />
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="الخامة"
                  value={formData.material}
                  onChange={(v) => setFormData({ ...formData, material: v })}
                />
                <Input
                  label="تعليمات الغسيل"
                  value={formData.care_instructions}
                  onChange={(v) =>
                    setFormData({ ...formData, care_instructions: v })
                  }
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(59,130,246,1)]">
            <div className="grid grid-cols-2 gap-4">
              {/* السعر الأساسي */}
              <Input
                label="السعر الأساسي"
                type="number"
                value={formData.base_price}
                onChange={(v) => setFormData({ ...formData, base_price: v })}
              />

              {/* اختيار نوع الخصم */}
              <div className="flex flex-col gap-2">
                <label className="font-black text-sm">خصم؟</label>
                <div className="flex border-4 border-black">
                  {["none", "percentage", "fixed"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, discount_type: t })
                      }
                      className={`flex-1 p-2 font-black text-xs ${
                        formData.discount_type === t
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                    >
                      {t === "none"
                        ? "لا يوجد"
                        : t === "percentage"
                          ? "%"
                          : "مبلغ"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* الحقل الذي كان ينقصك: يظهر فقط إذا تم اختيار نوع خصم */}
            {formData.discount_type !== "none" && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  label={
                    formData.discount_type === "percentage"
                      ? "نسبة الخصم (%)"
                      : "قيمة الخصم (ج.م)"
                  }
                  type="number"
                  value={formData.discount_value}
                  onChange={(v) =>
                    setFormData({ ...formData, discount_value: v })
                  }
                />
              </div>
            )}

            {/* عرض السعر النهائي */}
            <div className="mt-6 p-4 border-4 border-dashed border-black bg-green-50 flex justify-between items-center">
              <span className="font-black text-lg">السعر النهائي:</span>
              <span className="text-3xl font-black text-green-600">
                {(() => {
                  const base = parseFloat(formData.base_price) || 0;
                  const disc = parseFloat(formData.discount_value) || 0;
                  let final = base;
                  if (formData.discount_type === "percentage")
                    final = base - (base * disc) / 100;
                  else if (formData.discount_type === "fixed")
                    final = base - disc;

                  const result = final > 0 ? final : 0;
                  return result.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  });
                })()}
                <span className="text-sm mr-1 text-black font-bold">ج.م</span>
              </span>
            </div>
          </section>

          <button
            disabled={loading}
            className="w-full bg-green-500 py-6 text-3xl font-black border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:shadow-none transition-all italic"
          >
            {loading
              ? "جاري المعالجة..."
              : editingId
                ? "تحديث الموديل"
                : "نشر الموديل"}
          </button>

          {editingId && !loading && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full bg-gray-200 py-3 text-lg font-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none hover:bg-red-400 transition-all"
            >
              إلغاء وضع التعديل (الرجوع لإضافة منتج جديد)
            </button>
          )}
        </div>
      </form>

      <section className="mt-20">
        <h2 className="text-3xl font-black mb-6 italic underline decoration-yellow-400">
          المنتجات المرفوعة حالياً
        </h2>
        <table className="w-full border-4 border-black border-collapse bg-white">
          <thead>
            <tr className="bg-black text-white">
              <th className="border-2 border-black p-3 text-right">الصورة</th>
              <th className="border-2 border-black p-3 text-right">الاسم</th>
              <th className="border-2 border-black p-3 text-right">الفئة</th>
              <th className="border-2 border-black p-3 text-right">السعر</th>
              <th className="border-2 border-black p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(productsBySub)
              .flat()
              .map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border-2 border-black p-2 w-20">
                    {product.images?.[0] && (
                      <img
                        src={
                          typeof product.images[0] === "object"
                            ? product.images[0].urls[0]
                            : product.images[0]
                        }
                        className="w-16 h-16 object-cover border-2 border-black"
                        alt=""
                      />
                    )}
                  </td>
                  <td className="border-2 border-black p-3 font-bold">
                    {product.name} <br />
                    <span className="text-[10px] bg-yellow-300 px-1 border border-black">
                      {product.code}
                    </span>
                  </td>
                  <td className="border-2 border-black p-3 text-sm">
                    {product.sub_categories?.name}
                  </td>
                  <td className="border-2 border-black p-3 font-black">
                    {product.base_price} ج.م
                  </td>
                  <td className="border-2 border-black p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 text-white p-2 border-2 border-black"
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 text-white p-2 border-2 border-black"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-black text-xs">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-4 border-black p-2 font-bold focus:bg-yellow-50 outline-none"
      />
    </div>
  );
}
