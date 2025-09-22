'use client';

import { MapPin, Phone, Clock, Star } from 'lucide-react';

export default function GoogleMyBusiness() {
  const businessInfo = {
    name: "Gül-Tekin Mühendislik",
    address: "Yalıkavak, Bodrum, Muğla, Türkiye",
    phone: "0252 386 35 54",
    fax: "0252 386 41 34",
    email: "info@gul-tekinmuhendislik.com",
    rating: 5.0,
    reviewCount: 12,
    openNow: true,
    hours: {
      monday: "09:00 - 18:00",
      tuesday: "09:00 - 18:00",
      wednesday: "09:00 - 18:00",
      thursday: "09:00 - 18:00",
      friday: "09:00 - 18:00",
      saturday: "09:00 - 17:00",
      sunday: "Kapalı"
    },
    mapUrl: "https://share.google/XnDMvkV4bTVtWo6BV",
    description: "Yalıkavak ve Bodrum bölgesinde profesyonel mühendislik hizmetleri"
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white mb-2">{businessInfo.name}</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white font-medium">{businessInfo.rating}</span>
            <span className="text-gray-400">({businessInfo.reviewCount} değerlendirme)</span>
          </div>
          {businessInfo.openNow && (
            <span className="text-green-400 text-sm font-medium">Şu an açık</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-gray-300">{businessInfo.address}</p>
            <a 
              href={businessInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 text-sm mt-1 inline-block transition-colors"
            >
              Haritada Görüntüle →
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary" />
          <a 
            href={`tel:${businessInfo.phone.replace(/\s/g, '')}`}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {businessInfo.phone}
          </a>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-1" />
          <div className="text-sm">
            <p className="text-white font-medium mb-2">Çalışma Saatleri</p>
            <div className="space-y-1 text-gray-400">
              <div className="flex justify-between">
                <span>Pazartesi - Cuma:</span>
                <span>{businessInfo.hours.monday}</span>
              </div>
              <div className="flex justify-between">
                <span>Cumartesi:</span>
                <span>{businessInfo.hours.saturday}</span>
              </div>
              <div className="flex justify-between">
                <span>Pazar:</span>
                <span>{businessInfo.hours.sunday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-gray-400 text-sm mb-4">{businessInfo.description}</p>
        <a
          href={businessInfo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary font-medium rounded-lg transition-colors"
        >
          Google&apos;da Bizi Bulun
        </a>
      </div>
    </div>
  );
}