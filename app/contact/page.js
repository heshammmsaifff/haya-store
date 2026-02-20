"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function ContactPage() {
  const [loadingMap, setLoadingMap] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "", // اختياري
    phone: "", // إجباري
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // نجهز البيانات للإرسال، الإيميل لو فاضي هينزل NULL في القاعدة
      const payload = {
        ...formData,
        email: formData.email.trim() === "" ? null : formData.email,
      };

      const { error } = await supabase
        .from("contact_messages")
        .insert([payload]);

      if (error) throw error;

      Swal.fire({
        title: "MESSAGE SENT",
        text: "Thank you for reaching out. We will get back to you soon.",
        icon: "success",
        confirmButtonColor: "#000000",
        customClass: {
          popup: "rounded-none border border-black",
          confirmButton:
            "rounded-none uppercase tracking-[0.2em] text-[10px] px-8 py-3",
        },
      });

      // إعادة تعيين الفورم
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      Swal.fire({
        title: "ERROR",
        text: error.message || "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#000000",
        customClass: {
          popup: "rounded-none",
          confirmButton: "rounded-none uppercase tracking-widest text-xs",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* الجانب الأيسر: المعلومات */}
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-light uppercase tracking-tighter mb-8 italic">
                Get in <br /> Touch
              </h1>
              <p className="text-gray-500 font-light leading-relaxed max-w-md text-sm">
                We’re here to help you with any questions regarding our
                collections, orders, or styling advice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8 text-[10px] uppercase tracking-[0.3em]">
              {/* Email */}
              <div className="border-l border-black pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiMail size={12} className="text-black" />
                  <h3 className="font-black text-black">Email Us</h3>
                </div>
                <p className="text-gray-500 lowercase">info@haya.com</p>
              </div>

              {/* Visit Us */}
              <div className="border-l border-black pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiMapPin size={12} className="text-black" />
                  <h3 className="font-black text-black">Visit Us</h3>
                </div>
                <p className="text-gray-500">
                  Sharqia, Egypt <br /> Faqous
                </p>
              </div>

              {/* Call Us */}
              <div className="border-l border-black pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiPhone size={12} className="text-black" />
                  <h3 className="font-black text-black">Call Us</h3>
                </div>
                <a
                  href="tel:+201033372278"
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  +20 103 337 2278
                </a>
              </div>

              {/* WhatsApp */}
              <div className="border-l border-black pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaWhatsapp size={12} className="text-green-600" />
                  <h3 className="font-black text-black">WhatsApp</h3>
                </div>
                <a
                  href="https://wa.me/201033372278"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-green-600 transition-colors"
                >
                  +20 103 337 2278
                </a>
              </div>
            </div>
          </div>

          {/* الجانب الأيمن: الفورم */}
          <div className="bg-neutral-50 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {/* الاسم */}
                <input
                  required
                  name="name"
                  placeholder="FULL NAME *"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors text-[10px] uppercase tracking-widest"
                />

                {/* رقم الهاتف - إجباري */}
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="PHONE NUMBER *"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors text-[10px] uppercase tracking-widest"
                />

                {/* الإيميل - اختياري */}
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL ADDRESS (OPTIONAL)"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors text-[10px] uppercase tracking-widest"
                />

                {/* الموضوع */}
                <input
                  name="subject"
                  placeholder="SUBJECT (OPTIONAL)"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors text-[10px] uppercase tracking-widest"
                />

                {/* الرسالة */}
                <textarea
                  required
                  name="message"
                  rows="4"
                  placeholder="HOW CAN WE HELP? *"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors text-[10px] uppercase tracking-widest resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all disabled:bg-gray-400"
              >
                {loading ? "PROCESSING..." : "SEND MESSAGE"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* الخريطة */}
      <section className="relative w-full h-[500px] bg-gray-100 border-t border-gray-100 overflow-hidden group">
        {loadingMap && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 animate-pulse z-10">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
              Loading Map...
            </p>
          </div>
        )}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.663385736173!2d31.474668!3d30.015024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAwJzU0LjEiTiAzMcKwMjgNMjguOCJF!5e0!3m2!1sen!2seg!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          onLoad={() => setLoadingMap(false)}
          className={`grayscale hover:grayscale-0 transition-all duration-700 ${loadingMap ? "opacity-0" : "opacity-100"}`}
        ></iframe>
      </section>
    </main>
  );
}
