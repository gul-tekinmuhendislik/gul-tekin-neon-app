"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "@phosphor-icons/react";

const COOKIE_CONSENT_KEY = "gultekin_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, analytics: true, timestamp: Date.now() }));
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, analytics: false, timestamp: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-white border rounded-2xl shadow-2xl p-6 relative z-50">
        <button
          onClick={acceptEssential}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" weight="bold" />
        </button>
        <div className="flex items-start gap-4">
          <Cookie className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" weight="fill" />
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">Çerez Bildirimi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Web sitemizde deneyiminizi iyileştirmek, site trafiğini analiz etmek ve kişiselleştirilmiş içerik sunmak için çerezler kullanıyoruz.
              &quot;Tümünü Kabul Et&quot; seçeneğine tıklayarak analytics çerezlerini onaylayabilir veya yalnızca zorunlu çerezleri kabul edebilirsiniz.{" "}
              <a href="/privacy" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                KVKK Aydınlatma Metni
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Tümünü Kabul Et
              </button>
              <button
                onClick={acceptEssential}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Yalnızca Zorunlu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
