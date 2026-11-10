"use client";
import { withBasePath } from "@/lib/base-path";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    src: "/varmeks-isi-pompasi/Heat_pump_advertisement_poster_20260927130430.jpg",
    alt: "Varmeks ısı pompası tanıtım görseli 1",
  },
  {
    src: "/varmeks-isi-pompasi/Heat_pump_promo_poster_20260927130440.jpg",
    alt: "Varmeks ısı pompası tanıtım görseli 2",
  },
  {
    src: "/varmeks-isi-pompasi/Heat_pump_advertisement_poster_20260927130032.jpg",
    alt: "Varmeks ısı pompası tanıtım görseli 3",
  },
  {
    src: "/varmeks-isi-pompasi/Heat_pump_advertisement_poster_20260927130047.jpg",
    alt: "Varmeks ısı pompası tanıtım görseli 4",
  },
  {
    src: "/varmeks-isi-pompasi/DUO_series_heat_pump_advertisement_20260927131452.jpg",
    alt: "Varmeks DUO serisi ısı pompası tanıtım görseli",
  },
];

export default function VarmeksPromoSidebar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const showPrevious = () => {
    setCurrentIndex((index) => (index - 1 + slides.length) % slides.length);
  };

  const showNext = () => {
    setCurrentIndex((index) => (index + 1) % slides.length);
  };

  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-red-700">
            VARMEKS ISI POMPASI
          </p>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Isı pompası serilerini inceleyin
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Varmeks tanıtım görsellerine göz atın, ev ve villa tipi modelleri
            karşılaştırmak için ürün kataloğuna geçin.
          </p>
          <Link
            href="/urunler?marka=Varmeks"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Varmeks ürünlerini incele
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <aside
          className="mx-auto w-full max-w-[280px]"
          role="group"
          aria-roledescription="carousel"
          aria-label="Varmeks ısı pompası tanıtım görselleri"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="relative aspect-[7/12] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={slides[currentIndex].src}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Image
                  src={withBasePath(slides[currentIndex].src)}
                  alt={slides[currentIndex].alt}
                  fill
                  sizes="(max-width: 1023px) 280px, 280px"
                  className="object-contain"
                  priority={currentIndex === 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="min-w-12 text-sm tabular-nums text-slate-500" aria-live="off">
              {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1" aria-label="Slayt seçimi">
              {slides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`${index + 1}. görseli göster`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index
                      ? "w-5 bg-red-700"
                      : "w-2 bg-slate-300 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Önceki görsel"
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Sonraki görsel"
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}