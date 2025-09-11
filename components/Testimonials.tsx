"use client";

import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
  verified: boolean;
  image?: string;
}

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Mehmet Yılmaz",
    location: "Yalıkavak, Bodrum",
    rating: 5,
    comment: "Isı pompası kurulumumuz için Gül-Tekin Mühendislik'i tercih ettik. Profesyonel ekip, zamanında teslimat ve mükemmel işçilik. 2 yıldır sorunsuz çalışıyor, enerji faturalarımız %40 düştü.",
    service: "Isı Pompası Kurulumu",
    date: "2024-03-15",
    verified: true
  },
  {
    id: 2,
    name: "Ayşe Demir",
    location: "Gümüşlük, Bodrum",
    rating: 5,
    comment: "Villa projemizin tüm mekanik tesisatını Gül-Tekin yaptı. Yerden ısıtma sistemi harika çalışıyor. Teknik destek konusunda çok ilgililer, her aradığımızda hemen dönüş yapıyorlar.",
    service: "Yerden Isıtma Sistemi",
    date: "2024-02-10",
    verified: true
  },
  {
    id: 3,
    name: "Ali Kaya",
    location: "Turgutreis, Bodrum",
    rating: 5,
    comment: "Güneş enerjisi sistemi kurulumu için doğru adres. Detaylı fizibilite raporu hazırladılar, yatırım geri dönüş süresini net gösterdiler. 6 aydır elektrik faturası ödemiyoruz!",
    service: "Güneş Enerjisi Sistemi",
    date: "2024-01-20",
    verified: true
  },
  {
    id: 4,
    name: "Zeynep Öztürk",
    location: "Göltürkbükü, Bodrum",
    rating: 5,
    comment: "Su arıtma sistemi için birçok firma ile görüştük, en profesyonel yaklaşım Gül-Tekin'dendi. Su analizi yaptılar, ihtiyacımıza özel çözüm sundular. Artık güvenle su içiyoruz.",
    service: "Su Arıtma Sistemi",
    date: "2023-12-05",
    verified: true
  },
  {
    id: 5,
    name: "Hasan Çelik",
    location: "Yalıkavak Marina",
    rating: 5,
    comment: "VRF klima sistemimizin bakım ve onarımını 3 yıldır Gül-Tekin yapıyor. Periyodik bakımları aksatmıyorlar, arıza durumunda aynı gün müdahale ediyorlar. Güvenilir bir firma.",
    service: "VRF Klima Sistemi",
    date: "2023-11-12",
    verified: true
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Müşteri Deneyimleri
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            20 yılı aşkın tecrübemizle Bodrum bölgesinde yüzlerce projede güvenilir çözüm ortağı olduk
          </p>
          <div className="flex items-center justify-center mt-4 gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-gray-700 font-semibold">4.9/5</span>
            <span className="text-gray-500">(500+ müşteri)</span>
          </div>
        </div>

        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonialData.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-lg shadow-lg p-8 mx-auto max-w-3xl border border-gray-100">
                    <Quote className="w-10 h-10 text-blue-500 mb-4 opacity-50" />
                    
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {testimonial.verified && "✓ Doğrulanmış Müşteri"}
                      </span>
                    </div>

                    <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                      &ldquo;{testimonial.comment}&rdquo;
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                        <p className="text-sm text-blue-600 mt-1">{testimonial.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(testimonial.date).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long"
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {testimonialData.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? "w-8 bg-blue-600" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">500+</p>
            <p className="text-sm text-gray-600">Tamamlanmış Proje</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">20+</p>
            <p className="text-sm text-gray-600">Yıllık Deneyim</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">24/7</p>
            <p className="text-sm text-gray-600">Teknik Destek</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">100%</p>
            <p className="text-sm text-gray-600">Müşteri Memnuniyeti</p>
          </div>
        </div>
      </div>
    </section>
  );
}