'use client';

import Link from "next/link";
import { motion } from "framer-motion";

interface Lokasyon {
  id: number;
  ilce_adi: string;
  slug: string;
  il?: string;
  aciklama?: string;
  resim_url?: string;
  aktif: boolean;
  sira?: number;
}

interface LokasyonlarContentProps {
  lokasyonlar: Lokasyon[];
}

export default function LokasyonlarContent({
  lokasyonlar,
}: LokasyonlarContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hizmet Verdiğimiz Lokasyonlar
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Muğla ve çevresinde güvenilir mühendislik hizmetleri sunuyoruz
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lokasyonlar.map((lokasyon, index) => (
            <motion.div
              key={lokasyon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/lokasyonlar/${lokasyon.slug}`}>
                <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {lokasyon.resim_url ? (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={lokasyon.resim_url}
                        alt={lokasyon.ilce_adi}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-white opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {lokasyon.ilce_adi}
                    </h2>
                    {lokasyon.il && (
                      <p className="text-gray-500 mb-3">{lokasyon.il}</p>
                    )}
                    {lokasyon.aciklama && (
                      <p className="text-gray-600 line-clamp-3">
                        {lokasyon.aciklama}
                      </p>
                    )}

                    <div className="mt-4 flex items-center text-blue-600 font-medium">
                      <span>Detaylı Bilgi</span>
                      <svg
                        className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {lokasyonlar.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Henüz lokasyon eklenmemiş.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
