"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Shield, 
  Wrench, 
  Phone,
  CheckCircle,
  Zap,
  Trophy
} from "lucide-react";

interface FeatureCardProps {
  number: number;
  title: string;
  content: string;
  icon: React.ReactNode;
  isOpen: boolean;
  loadingWidthPercent?: number;
}

function FeatureCard({
  number,
  title,
  content,
  icon,
  isOpen,
  loadingWidthPercent = 0,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "transform-gpu rounded-xl border transition-all duration-500",
        isOpen
          ? "scale-100 border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 shadow-lg"
          : "scale-95 border-gray-200 opacity-60 saturate-0 hover:opacity-80"
      )}
    >
      <div className="flex w-full items-center gap-4 p-6">
        <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-3xl font-bold text-gray-200">{String(number).padStart(2, "0")}</span>
      </div>
      <div
        className={cn(
          "w-full transform-gpu overflow-hidden text-left text-gray-600 transition-all duration-500",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="px-6 pb-4 text-base leading-relaxed">{content}</p>
        <div className="w-full px-6 pb-6">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out"
              style={{ width: `${loadingWidthPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "7/24 Hizmet",
    content: "Acil durumlar için 7 gün 24 saat ulaşabileceğiniz teknik destek hattımız ile yanınızdayız. Sıhhi tesisat arızalarınıza anında müdahale ediyoruz.",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    title: "Garantili İşçilik",
    content: "Tüm montaj ve tamir işlerimizde 2 yıl işçilik garantisi sunuyoruz. Kullandığımız malzemeler TSE belgeli ve orijinal ürünlerdir.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Uzman Kadro",
    content: "Alanında uzman mühendis ve teknisyenlerden oluşan ekibimiz, modern ekipmanlarla güvenilir çözümler sunuyor.",
    icon: <Wrench className="w-6 h-6" />,
  },
  {
    title: "Hızlı Müdahale",
    content: "Bodrum ve Yalıkavak bölgesinde ortalama 30 dakika içinde adresinize ulaşıyor, sorunlarınıza hızlı çözüm üretiyoruz.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "Şeffaf Fiyatlandırma",
    content: "İşe başlamadan önce detaylı fiyat teklifi sunuyor, sürpriz ücretler olmadan şeffaf hizmet veriyoruz.",
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    title: "Müşteri Memnuniyeti",
    content: "500'den fazla mutlu müşterimiz ile %98 memnuniyet oranına sahibiz. Referanslarımız bizim en büyük gururumuzdur.",
    icon: <Trophy className="w-6 h-6" />,
  },
];

export function FeatureSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const autoPlayDuration = 5000; // 5 seconds per feature

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingPercent((prev) => {
        if (prev >= 100) {
          setOpenIndex((prevIndex) => (prevIndex + 1) % features.length);
          return 0;
        }
        return prev + 2;
      });
    }, autoPlayDuration / 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Neden Bizi Tercih Etmelisiniz?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bodrum ve Yalıkavak bölgesinde güvenilir, kaliteli ve profesyonel mühendislik hizmetleri
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => {
                setOpenIndex(index);
                setLoadingPercent(0);
              }}
              className="cursor-pointer"
            >
              <FeatureCard
                number={index + 1}
                title={feature.title}
                content={feature.content}
                icon={feature.icon}
                isOpen={openIndex === index}
                loadingWidthPercent={openIndex === index ? loadingPercent : 0}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-sm text-gray-500">
            <Phone className="w-4 h-4" />
            <span>Hemen arayın: +90 (252) 123 45 67</span>
          </div>
        </div>
      </div>
    </section>
  );
}