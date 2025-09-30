'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MahalleData {
  ilce_adi: string;
  mahalle_adi: string;
  aciklama?: string;
  hizmetler?: string[];
}

export default function MahallePage() {
  const params = useParams();
  const { slug, mahalle } = params;
  const [data, setData] = useState<MahalleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mahalle adını formatla (slug'dan normal metne)
    const mahalleAdi = (mahalle as string)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const ilceAdi = (slug as string)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    setData({
      ilce_adi: ilceAdi,
      mahalle_adi: mahalleAdi,
      aciklama: `${ilceAdi} ${mahalleAdi}'nde profesyonel su sistemleri kurulumu ve bakım hizmetleri sunuyoruz.`,
      hizmetler: [
        'Hidrofor Sistemleri',
        'Su Depoları',
        'Su Arıtma Sistemleri',
        'Pompa Sistemleri',
        'Bakım ve Onarım',
      ],
    });
    setLoading(false);
  }, [slug, mahalle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mahalle Bulunamadı</h1>
          <Link href="/lokasyonlar" className="text-blue-600 hover:underline">
            Lokasyonlar sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/lokasyonlar" className="hover:text-blue-600">Lokasyonlar</Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/lokasyonlar/${slug}`} className="hover:text-blue-600">
                {data.ilce_adi}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{data.mahalle_adi}</li>
          </ol>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {data.ilce_adi} {data.mahalle_adi}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {data.aciklama}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Hizmetler */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sunduğumuz Hizmetler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.hizmetler?.map((hizmet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg"
                  >
                    <svg
                      className="w-6 h-6 text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-800 font-medium">{hizmet}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Neden Biz */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Neden Gül Tekin Mühendislik?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Deneyimli Ekip</h3>
                    <p className="text-gray-600">Yılların deneyimiyle profesyonel hizmet</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7/24 Destek</h3>
                    <p className="text-gray-600">Acil durumlarda hızlı müdahale</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Uygun Fiyat</h3>
                    <p className="text-gray-600">Kaliteli hizmet, makul fiyat</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar - İletişim */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Hemen İletişime Geçin</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-100">Telefon</p>
                    <a href="tel:+902523160505" className="text-lg font-semibold hover:underline">
                      +90 (252) 316 05 05
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-100">E-posta</p>
                    <a href="mailto:info@gul-tekinmuhendislik.com" className="text-lg font-semibold hover:underline break-all">
                      info@gul-tekinmuhendislik.com
                    </a>
                  </div>
                </div>
              </div>
              <Link
                href="/contact"
                className="block w-full bg-white text-blue-600 text-center font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
              >
                İletişim Formu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}