"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
// استيراد Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";

// استيراد ستايلات Swiper
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

export default function Hero() {
  const [headers, setHeaders] = useState([]); // تغيير الاسم لمصفوفة
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getHeaders() {
      try {
        const { data, error } = await supabase
          .from("headers")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }); // نجلب الكل مرتبين

        if (error) throw error;
        setHeaders(data || []);
      } catch (err) {
        console.error("Error fetching headers:", err.message);
      } finally {
        setLoading(false);
      }
    }
    getHeaders();
  }, []);

  if (loading)
    return (
      <div className="h-screen w-full bg-neutral-900 animate-pulse flex items-center justify-center">
        <span className="text-white/20 tracking-[0.5em] uppercase text-xs">
          Haya Store
        </span>
      </div>
    );

  if (headers.length === 0) return null;

  return (
    <section className="relative -mt-20 h-screen w-full overflow-hidden bg-neutral-900">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation]}
        effect="fade" // تأثير التلاشي الفاخر
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={headers.length > 1}
        className="h-full w-full"
      >
        {headers.map((header) => (
          <SwiperSlide key={header.id} className="relative h-full w-full">
            {/* الخلفية */}
            <div className="absolute inset-0">
              <img
                src={header.image_url}
                alt={header.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
            </div>

            {/* المحتوى النصي */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between text-center text-white px-6 py-20">
              {/* حاوية فارغة علوية للموازنة (اختياري) */}
              <div className="h-20" />

              {/* حاوية النصوص (العنوان والفرعي) - تظل في المنتصف */}
              <div className="max-w-4xl space-y-6">
                {header.subtitle && (
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4 animate-fade-in-up">
                    {header.subtitle}
                  </p>
                )}

                <h1 className="text-5xl md:text-[7rem] font-light tracking-tighter uppercase leading-[0.9] animate-fade-in-up delay-100">
                  {header.title}
                </h1>
              </div>

              {/* الزر - سيصبح في الأسفل بسبب justify-between */}
              {header.link_url && (
                <div className="pb-10 animate-fade-in-up delay-200">
                  <Link
                    href={header.link_url}
                    className="inline-block border border-white px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-transparent hover:text-white transition-all duration-500"
                  >
                    Explore More
                  </Link>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* مؤشر التمرير السفلي */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
