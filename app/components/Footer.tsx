import Image from "next/image";
import Link from "next/link";
import { Globe, BookOpen, Facebook, MessageCircle, Instagram, MapPin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="Gül-Tekin Mühendislik - Bodrum Mekanik Tesisat ve Enerji Sistemleri" 
                width={150} 
                height={40} 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm">
              Bodrum ve Milas bölgesinde mekanik tesisat sistemleri ve enerji verimliliği çözümleri sunuyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Bağlantılar
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Kullanım Şartları
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              İletişim
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Email: info@gul-tekinmuhendislik.com</li>
              <li>Tel: 0252 386 35 54</li>
              <li>Fax: 0252 386 41 34</li>
              <li>Gsm: 0532 317 78 59</li>
              <li>Adres: Gökçebel Mah. İnönü Cad. 61/D Yalıkavak, Bodrum/Muğla</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Gül-Tekin Mühendislik. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://yalikavak.gul-tekinmuhendislik.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Gül-Tekin Mühendislik Web Sitesi"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a 
                href="https://gultekinmuhendislik.substack.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Gül-Tekin Mühendislik Blog"
              >
                <BookOpen className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/gultekinbodrum" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Gül-Tekin Mühendislik Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/gultekinmuhendislik48/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Gül-Tekin Mühendislik Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/905323177859" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-colors"
                aria-label="Gül-Tekin Mühendislik WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://share.google/qhY0hk8fYNOH6GPwY" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors"
                aria-label="Gül-Tekin Mühendislik Google Maps"
              >
                <MapPin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/gul-tekinmuhendislik" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Gül-Tekin Mühendislik GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}