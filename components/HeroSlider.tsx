"use client";
import { withBasePath } from "@/lib/base-path";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Flame, 
  SunMedium, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface SlideData {
  id: number;
  image: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  stats: { label: string; value: string }[];
  primaryBtn: { text: string; href: string };
  secondaryBtn: { text: string; href: string };
}

const slides: SlideData[] = [
  {
    id: 1,
    image: "/images/hero/varmeks-hero-1.webp",
    badge: "Ege & Akdeniz Mimarisine Özel İklimlendirme",
    title: "Varmeks Yeni Nesil",
    highlight: "Isı Pompası Sistemleri",
    description: "Muğla ve Bodrum'un seçkin villalarında %75'e varan enerji tasarrufu, sessiz çalışma ve 4 mevsim kesintisiz konfor.",
    stats: [
      { label: "Enerji Tasarrufu", value: "%75" },
      { label: "Maksimum COP", value: "4.8" },
      { label: "Çalışma Aralığı", value: "-30°C / +45°C" },
    ],
    primaryBtn: { text: "Varmeks Ürünlerini İncele", href: "/urunler?marka=Varmeks" },
    secondaryBtn: { text: "Ücretsiz Keşif Al", href: "/contact" },
  },
  {
    id: 2,
    image: "/images/hero/varmeks-hero-2.webp",
    badge: "R290 Çevre Dostu Soğutucu Akışkan",
    title: "A+++ DC Inverter",
    highlight: "Yüksek Verimli Teknoloji",
    description: "Akıllı Wi-Fi kontrolü, 75°C sıcak su üretimi ve Gül-Tekin Mühendislik 20 yıllık uzman montaj garantisi.",
    stats: [
      { label: "Enerji Sınıfı", value: "A+++" },
      { label: "Sıcak Su", value: "75°C" },
      { label: "Yetkili Servis", value: "7/24" },
    ],
    primaryBtn: { text: "Isı Pompası Çözümleri", href: "/solimpeks-isi-pompalari" },
    secondaryBtn: { text: "İletişime Geç", href: "/contact" },
  },
  {
    id: 3,
    image: "/images/hero/varmeks-hero-3.webp",
    badge: "Hibrit Enerji Mühendisliği",
    title: "Güneş Enerjisi &",
    highlight: "Sıfır Karbon Konfor",
    description: "Güneş panelleri ile entegre çalışan hibrit ısı pompaları ile villanızın elektrik ve iklimlendirme ihtiyacını doğadan karşılayın.",
    stats: [
      { label: "Tamamlanan Proje", value: "236+" },
      { label: "Hizmet Bölgesi", value: "13 İlçe" },
      { label: "Müşteri Memnuniyeti", value: "%98" },
    ],
    primaryBtn: { text: "Güneş Enerjisi Sistemleri", href: "/gunes-enerjisi" },
    secondaryBtn: { text: "Projelerimizi Gör", href: "/projeler" },
  },
];

interface HeroSliderProps {
  projectCount?: number;
  locationCount?: number;
}

export default function HeroSlider({ projectCount = 236, locationCount = 13 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const currentSlide = slides[currentIndex];

  return (
    <section 
      className="relative min-h-[92vh] lg:min-h-[95vh] w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Slides with Crossfade Animation */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={withBasePath(currentSlide.image)}
            alt={currentSlide.title}
            fill
            priority={currentIndex === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Multi-layered cinematic gradient overlays for rich contrast & readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,153,0.12),transparent_70%)]" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Text Content & CTAs */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            
            {/* Top Badge */}
            <motion.div
              key={`badge-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#00E599] text-xs sm:text-sm font-medium w-fit mb-4 shadow-lg shadow-[#00E599]/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E599] animate-pulse" />
              <span>{currentSlide.badge}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]"
            >
              {currentSlide.title}{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] via-[#00E5BF] to-teal-300">
                {currentSlide.highlight}
              </span>
            </motion.h1>

            {/* Subtitle / Description */}
            <motion.p
              key={`desc-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-light"
            >
              {currentSlide.description}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              key={`stats-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg pt-4 border-t border-white/10"
            >
              {currentSlide.stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#00E599] tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 font-normal">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Buttons / Actions */}
            <motion.div
              key={`actions-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-5"
            >
              <Link
                href={currentSlide.primaryBtn.href}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#00E599] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-950 shadow-xl shadow-[#00E599]/25 transition-all duration-300 hover:bg-[#00E5BF] hover:shadow-[#00E5BF]/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{currentSlide.primaryBtn.text}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href={currentSlide.secondaryBtn.href}
                className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentSlide.secondaryBtn.text}
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Feature Glass Cards */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            
            {/* Card 1: Authority & Engineering */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-[#00E599]/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-[#00E599]/15 text-[#00E599]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Gül-Tekin Mühendislik Güvencesi</h4>
                  <p className="text-xs text-slate-400 mt-0.5">20+ Yıllık Bölgesel İklimlendirme Deneyimi</p>
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-3">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599]" /> {projectCount}+ Proje
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599]" /> {locationCount} İlçe Hizmeti
                </span>
              </div>
            </motion.div>

            {/* Card 2: Varmeks Technology */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-[#00E599]/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-teal-500/15 text-teal-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Varmeks Yetkili Bayi & Servis</h4>
                  <p className="text-xs text-slate-400 mt-0.5">R290 & R32 Yüksek Verimli Isı Pompaları</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Bodrum, Milas ve tüm Muğla bölgesinde anahtar teslim montaj, periyodik bakım ve 7/24 teknik servis.
              </p>
            </motion.div>

            {/* Card 3: Free Consultation Quick Action */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#00E599]/20 to-slate-900/80 backdrop-blur-xl border border-[#00E599]/30 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <SunMedium className="w-4 h-4 text-[#00E599]" />
                  <span>Villanıza Özel Enerji Analizi</span>
                </div>
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-[#00E599] hover:text-[#00E5BF] underline underline-offset-4"
                >
                  Hemen Keşif İste →
                </Link>
              </div>
            </motion.div>

          </div>

        </div>
      </div>

      {/* Slider Controls: Arrows & Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Slide Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                currentIndex === idx 
                  ? "w-8 sm:w-10 bg-[#00E599] shadow-md shadow-[#00E599]/50" 
                  : "w-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Previous / Next Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Önceki Slayt"
            className="p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-[#00E599] hover:text-slate-950 backdrop-blur-md border border-white/10 text-white transition-all duration-200 active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Sonraki Slayt"
            className="p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-[#00E599] hover:text-slate-950 backdrop-blur-md border border-white/10 text-white transition-all duration-200 active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
