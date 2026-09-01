"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  Flag,
  Percent,
  Snowflake,
  Wifi,
  Leaf,
  PhoneCall,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Flame,
  Clock,
  Sparkles
} from "lucide-react";

export default function VarmeksWarrantyFeatures() {
  const warranties = [
    {
      id: "yerli-uretim",
      badge: "Milli Mühendislik",
      title: "Ürünlerimiz Yerli Üretimdir",
      description: "Türkiye'nin öncü yerli ısı pompası teknolojisi. Hızlı yedek parça temini, yerli Ar-Ge ve Gül-Tekin Mühendislik yerinde teknik destek ağı.",
      icon: Flag,
      gradient: "from-red-600 to-rose-700",
      bgLight: "bg-red-50/70 border-red-200/80 text-red-700",
      tag: "🇹🇷 %100 Yerli Üretim",
    },
    {
      id: "5-yil-kompresor",
      badge: "Maksimum Güvence",
      title: "5 Yıl Kompresör Garantisi",
      description: "Isı pompasının kalbi olan DC Inverter kompresör ünitesine 5 yıl tam üretici ve yetkili servis garantisi. Uzun ömürlü ve sorunsuz çalışma.",
      icon: Cpu,
      gradient: "from-blue-600 to-indigo-700",
      bgLight: "bg-blue-50/70 border-blue-200/80 text-blue-700",
      tag: "⚙️ 5 Yıl Güvence",
    },
    {
      id: "3-yil-cihaz",
      badge: "Tam Kapsam",
      title: "3 Yıl Cihaz Garantisi",
      description: "Tüm mekanik, hidrolik ve elektronik aksamları kapsayan 3 yıllık tam cihaz garantisi. Gül-Tekin Mühendislik 7/24 hızlı müdahale güvencesi.",
      icon: ShieldCheck,
      gradient: "from-emerald-600 to-teal-700",
      bgLight: "bg-emerald-50/70 border-emerald-200/80 text-emerald-700",
      tag: "🛡️ 3 Yıl Tam Garanti",
    },
  ];

  const highlights = [
    {
      icon: Percent,
      title: "%-80'e Varan Tasarruf",
      subtitle: "Yüksek Enerji Verimliliği",
      description: "Fosil yakıt ve klasik ısıtıcılara göre elektrik tüketiminde %80'e varan tasarruf sağlayarak faturanızı minimuma indirir.",
      color: "text-emerald-600 bg-emerald-100/80",
    },
    {
      icon: Snowflake,
      title: "-30°C'ye Kadar Kesintisiz Isıtma",
      subtitle: "Zorlu İklim Dayanımı",
      description: "EVI (Enhanced Vapor Injection) teknolojisi ile dondurucu soğuklarda dahi yüksek COP ve kesintisiz sıcak su performansı.",
      color: "text-blue-600 bg-blue-100/80",
    },
    {
      icon: Wifi,
      title: "Akıllı Wi-Fi Kontrolü",
      subtitle: "Uzaktan Yönetim",
      description: "Akıllı telefon uygulamanızdan evinizin sıcaklığını dilediğiniz yerden yönetin, enerji sarfiyatını anlık takip edin.",
      color: "text-purple-600 bg-purple-100/80",
    },
    {
      icon: Leaf,
      title: "Ultra-Düşük GWP Doğal Gaz",
      subtitle: "R290 & R32 Çevre Dostu",
      description: "Ozon tabakasına zarar vermeyen, küresel ısınma potansiyeli ultra düşük yeni nesil çevre dostu akışkan teknolojisi.",
      color: "text-teal-600 bg-teal-100/80",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00E599]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04),transparent_60%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#00E599] text-xs sm:text-sm font-semibold mb-4 shadow-lg">
            <Sparkles className="w-4 h-4 text-[#00E599]" />
            <span>Gül-Tekin Mühendislik & Varmeks Güvencesi</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            GÜL-TEKİN ile Yüksek Performanslı{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-[#00E599]">
              Isıtma ve Enerji Çözümleri
            </span>
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Türkiye'nin yerli üretim gücü Varmeks ve Gül-Tekin Mühendislik 20+ yıllık saha tecrübesiyle Bodrum ve tüm Muğla'da maksimum konfor, minimum enerji tüketimi.
          </p>
        </div>

        {/* 1. THREE MAIN GUARANTEE & DOMESTIC PRODUCTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {warranties.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative rounded-3xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 p-7 sm:p-8 hover:border-slate-500 transition-all duration-300 hover:-translate-y-1.5 shadow-2xl flex flex-col justify-between group overflow-hidden"
              >
                {/* Top Glowing Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient}`} />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#00E599] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
                  <span>Resmi Yetkili Bayi & Servis Güvencesi</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 2. FOUR PERFORMANCE PILLARS (Poster Highlights) */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 sm:p-10 lg:p-12 mb-16 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[#00E599] font-bold mb-1">
                    {feat.subtitle}
                  </span>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {feat.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CONTACT & SHOWROOM STRIP (From the poster footer) */}
        <div className="rounded-3xl bg-gradient-to-r from-red-600/90 via-slate-900 to-slate-900 border border-red-500/30 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="p-3.5 rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <PhoneCall className="w-7 h-7 text-[#00E599] animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-200 uppercase tracking-wide">
                Gül-Tekin Mühendislik • Bodrum & Muğla Yetkili Satış & Servis
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-3">
                <span>0532 317 78 59</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/30">
                  7/24 Teknik Destek
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Gökçebel Mah. İnönü Cad. 61/D Yalıkavak / Muğla</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto">
            <Link
              href="tel:05323177859"
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-[#00E599] hover:bg-[#00E5BF] text-slate-950 font-bold px-6 py-3.5 text-sm transition-all duration-200 shadow-lg shadow-[#00E599]/20 hover:scale-102 active:scale-98"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hemen Ara</span>
            </Link>

            <Link
              href="/contact"
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 text-sm border border-white/20 transition-all duration-200 hover:scale-102 active:scale-98"
            >
              <span>Ücretsiz Keşif İste</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
