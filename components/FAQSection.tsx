"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import FAQSchema from "./FAQSchema";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export default function FAQSection({
  title = "Sıkça Sorulan Sorular",
  subtitle = "Ürün ve hizmetlerimiz hakkında en çok merak edilen teknik ve operasyonel detaylar.",
  items,
  className = "",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`my-12 ${className}`}>
      {/* Inject Google FAQPage JSON-LD Schema */}
      <FAQSchema items={items} />

      <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xs">
        
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-[#00E599]/15 text-[#00875A]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Merak Edilenler & Uzman Yanıtları
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 mb-8 font-light leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Accordion List */}
        <div className="space-y-3.5">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#00E599]/50 shadow-md ring-1 ring-[#00E599]/20"
                    : "bg-white/80 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      S{index + 1}
                    </span>
                    <span>{item.question}</span>
                  </span>
                  <div className={`p-1.5 rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 ${isOpen ? "rotate-180 bg-[#00E599]/20 text-[#00875A]" : ""}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-light border-t border-slate-100">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
            Sorunuzun yanıtını bulamadınız mı?
          </span>
          <a
            href="tel:05323177859"
            className="font-semibold text-[#00875A] hover:underline flex items-center gap-1"
          >
            Mühendisimize Danışın: 0532 317 78 59 →
          </a>
        </div>

      </div>
    </div>
  );
}
