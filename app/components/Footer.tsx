"use client";

import Image from "next/image";
import { withBasePath } from "@/lib/base-path";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import DynamicFooterLinks from "./DynamicFooterLinks";
import { CONTACT_INFO, phoneHref, whatsappHref } from "@/lib/contact-info";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <Image 
                src={withBasePath("/logo.png")} 
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
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-gray-900 transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a href={phoneHref(CONTACT_INFO.landline.tel)} onClick={() => typeof window !== 'undefined' && typeof window.gtag === 'function' && window.gtag('event', 'conversion', { event_category: 'contact', event_label: 'phone_landline_click' })} className="hover:text-gray-900 transition-colors">
                  Tel: {CONTACT_INFO.landline.displayFormatted}
                </a>
              </li>
              <li>
                <a href={whatsappHref(CONTACT_INFO.whatsapp.tel)} target="_blank" rel="noopener noreferrer" onClick={() => typeof window !== 'undefined' && typeof window.gtag === 'function' && window.gtag('event', 'conversion', { event_category: 'contact', event_label: 'whatsapp_footer_click' })} className="hover:text-gray-900 transition-colors">
                  WhatsApp: {CONTACT_INFO.whatsapp.displayFormatted}
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
                Muğla&apos;da <Heart className="inline w-4 h-4 text-red-500" weight="fill" /> ile yapıldı
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