'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const locations = [
  {
    id: 1,
    name: 'Bodrum',
    slug: 'bodrum',
    description: 'Bodrum ve tüm mahallelerinde mühendislik hizmetleri',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    name: 'Milas',
    slug: 'milas',
    description: 'Milas merkez ve köylerinde güvenilir çözümler',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    name: 'Yatağan',
    slug: 'yatagan',
    description: 'Endüstriyel ve konut projelerine mühendislik desteği',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    name: 'Muğla Merkez',
    slug: 'mentese-mugla',
    description: 'Menteşe ilçesinde tüm mühendislik ihtiyaçlarınıza çözüm',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-orange-500 to-red-500'
  }
];

export default function ServiceLocations() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Hizmet Verdiğimiz <span className="text-[#00E599]">Lokasyonlar</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Muğla genelinde 4 farklı lokasyonda, yerel ihtiyaçlara uygun mühendislik çözümleri sunuyoruz
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/lokasyonlar/${location.slug}`}>
                <div className="group relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${location.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="p-6 lg:p-8">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${location.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {location.icon}
                    </div>

                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
                      {location.name}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {location.description}
                    </p>

                    <div className="flex items-center text-blue-600 font-semibold group-hover:text-[#00E599] transition-colors">
                      <span className="mr-2">Detaylı Bilgi</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/lokasyonlar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00E599] to-[#00E5BF] text-gray-900 font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <span>Tüm Lokasyonları Gör</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}