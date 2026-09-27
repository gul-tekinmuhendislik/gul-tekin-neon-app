'use client';

import { MapPin, Phone, Clock, Star } from 'lucide-react';
import { CONTACT_INFO, phoneHref, whatsappHref } from '@/lib/contact-info';

export default function GoogleMyBusiness() {
  const businessInfo = {
    name: "Gül-Tekin Mühendislik",
    address: "Gökçebel Mah. İnönü Cad. 61/D, Yalıkavak, Bodrum, Muğla 48990",
    phone: CONTACT_INFO.landline.displayFormatted,
    mobile: CONTACT_INFO.mobile.displayFormatted,
    whatsapp: CONTACT_INFO.whatsapp.tel,
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
    mapUrl: "https://share.google/VJ161BKEdDPp0vMKU",
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">{businessInfo.name}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="font-medium text-gray-900">{businessInfo.rating}</span>
            <span className="text-sm text-gray-600">({businessInfo.reviewCount} değerlendirme)</span>
          </div>
          {businessInfo.openNow && (
            <span className="text-sm font-medium text-green-700">Şu an açık</span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <p className="text-gray-700">{businessInfo.address}</p>
            <a 
              href={businessInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
            >
              Haritada Görüntüle →
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div className="flex min-w-0 flex-col gap-2">
            <a
              href={phoneHref(CONTACT_INFO.landline.tel)}
              className="flex flex-wrap items-baseline gap-x-2 text-gray-900 transition-colors hover:text-blue-800"
            >
              <span className="text-sm text-gray-600">Telefon</span>
              <span className="whitespace-nowrap text-base font-semibold tabular-nums">{businessInfo.phone}</span>
            </a>
            <a
              href={phoneHref(CONTACT_INFO.mobile.tel)}
              className="flex flex-wrap items-baseline gap-x-2 text-gray-900 transition-colors hover:text-blue-800"
            >
              <span className="text-sm text-gray-600">Cep telefonu</span>
              <span className="whitespace-nowrap text-base font-semibold tabular-nums">{businessInfo.mobile}</span>
            </a>
            <a
              href={whatsappHref(CONTACT_INFO.whatsapp.tel)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-baseline gap-x-2 text-green-800 transition-colors hover:text-green-950"
            >
              <span className="text-sm">WhatsApp</span>
              <span className="whitespace-nowrap text-base font-semibold tabular-nums">{businessInfo.whatsapp}</span>
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div className="text-sm">
            <p className="mb-2 font-medium text-gray-900">Çalışma Saatleri</p>
            <div className="space-y-1 text-gray-600">
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
    </section>
  );
}