"use client";

import Image from "next/image";
import Link from "next/link";
import DynamicFooterLinks from "./DynamicFooterLinks";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="Gül-Tekin Mühendislik - Mekanik Tesisat ve Enerji Sistemleri" 
                width={150} 
                height={40} 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm">
              Muğla bölgesinde mekanik tesisat sistemleri ve enerji verimliliği çözümleri sunuyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Bağlantılar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Kullanım Şartları
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              İletişim
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a href="mailto:info@gul-tekinmuhendislik.com" className="hover:text-gray-900 transition-colors">
                  info@gul-tekinmuhendislik.com
                </a>
              </li>
              <li>
                <a href="tel:+902523863554" onClick={() => typeof window !== 'undefined' && typeof window.gtag === 'function' && window.gtag('event', 'conversion', { event_category: 'contact', event_label: 'phone_landline_click' })} className="hover:text-gray-900 transition-colors">
                  Tel: 0252 386 35 54
                </a>
              </li>
              <li>
                <a href="https://wa.me/905323177859" target="_blank" rel="noopener noreferrer" onClick={() => typeof window !== 'undefined' && typeof window.gtag === 'function' && window.gtag('event', 'conversion', { event_category: 'contact', event_label: 'whatsapp_footer_click' })} className="hover:text-gray-900 transition-colors">
                  WhatsApp: 0532 317 78 59
                </a>
              </li>
              <li>Adres: Gökçebel Mah. İnönü Cad. 61/D Yalıkavak/Muğla</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-gray-500 text-sm">
              <p>© {new Date().getFullYear()} Gül-Tekin Mühendislik. Tüm hakları saklıdır.</p>
              <span className="hidden sm:inline">•</span>
              <p className="flex items-center gap-1">
                Muğla&apos;da <span className="text-red-500">❤️</span> ile yapıldı
              </p>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://ebartan.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors underline"
              >
                ebartan.dev
              </a>
            </div>
            <DynamicFooterLinks />
          </div>
        </div>
      </div>
    </footer>
  );
}