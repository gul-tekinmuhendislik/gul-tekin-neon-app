'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

interface Urun {
  id: string;
  urun_adi: string;
  fiyat?: number | string;
  kategori?: string;
  marka?: string;
  cloudinary_url?: string;
}

interface Hizmet {
  id: string;
  hizmet_adi: string;
  aciklama?: string;
  kategori?: string;
  slug?: string;
  resim_url?: string;
  cloudinary_url?: string;
  urunler?: Urun[];
}

interface Mahalle {
  id: number;
  mahalle_adi: string;
  slug?: string;
  aciklama?: string;
  proje_sayisi?: number;
}

export default function LokasyonDetayPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [lokasyon, setLokasyon] = useState<Lokasyon | null>(null);
  const [hizmetler, setHizmetler] = useState<Hizmet[]>([]);
  const [mahalleler, setMahalleler] = useState<Mahalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (slug) {
        try {
          // Validate slug
          if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            throw new Error('Geçersiz lokasyon bilgisi');
          }

          // Encode slug for URL safety
          const encodedSlug = encodeURIComponent(slug);
          const response = await fetch(`/api/lokasyonlar/${encodedSlug}`);

          // Check if response is OK
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Lokasyon bulunamadı (${response.status})`;
            throw new Error(errorMessage);
          }

          const data = await response.json();

          if (!data.lokasyon) {
            throw new Error('Lokasyon bilgisi alınamadı');
          }

          setLokasyon(data.lokasyon);
          setHizmetler(data.hizmetler || []);
          setMahalleler(data.mahalleler || []);
          setError(null); // Clear any previous errors
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Lokasyon detayı yüklenemedi';
          console.error('Lokasyon detayı yüklenemedi:', error);
          setError(errorMessage);
          setLokasyon(null);
          setHizmetler([]);
          setMahalleler([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [slug]);

  const fetchLokasyonDetay = async () => {
    try {
      // Validate slug
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        throw new Error('Geçersiz lokasyon bilgisi');
      }

      // Encode slug for URL safety
      const encodedSlug = encodeURIComponent(slug);
      const response = await fetch(`/api/lokasyonlar/${encodedSlug}`);

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Lokasyon bulunamadı (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.lokasyon) {
        throw new Error('Lokasyon bilgisi alınamadı');
      }

      setLokasyon(data.lokasyon);
      setHizmetler(data.hizmetler || []);
      setMahalleler(data.mahalleler || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lokasyon detayı yüklenemedi';
      console.error('Lokasyon detayı yüklenemedi:', error);
      setError(errorMessage);
      setLokasyon(null);
      setHizmetler([]);
      setMahalleler([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !lokasyon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Bir Hata Oluştu' : 'Lokasyon Bulunamadı'}
          </h2>
          {error && (
            <p className="text-gray-600 mb-6">
              {error}
            </p>
          )}
          <div className="space-y-3">
            <Link
              href="/lokasyonlar"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tüm Lokasyonlara Dön
            </Link>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchLokasyonDetay();
              }}
              className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-blue-600 to-blue-800">
        {lokasyon.resim_url ? (
          <img
            src={lokasyon.resim_url}
            alt={lokasyon.ilce_adi}
            className="w-full h-full object-cover opacity-30"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              {lokasyon.ilce_adi}
            </motion.h1>
            {lokasyon.il && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl md:text-2xl"
              >
                {lokasyon.il}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Açıklama */}
        {lokasyon.aciklama && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <p className="text-lg text-gray-600 leading-relaxed">
              {lokasyon.aciklama}
            </p>
          </motion.div>
        )}

        {/* Mahalleler */}
        {mahalleler.length > 0 && (
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 mb-8 text-center"
            >
              {lokasyon.ilce_adi} Mahalleleri
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {mahalleler.map((mahalle, index) => (
                <motion.div
                  key={mahalle.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 text-center group hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 cursor-pointer"
                >
                  <div className="text-blue-500 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {mahalle.mahalle_adi}
                  </h3>
                  {mahalle.proje_sayisi !== undefined && mahalle.proje_sayisi > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{mahalle.proje_sayisi} proje</p>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {mahalleler.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-600">
                  <span className="font-semibold text-blue-600">{mahalleler.length}</span> mahallede hizmet veriyoruz
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Hizmetler */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            {lokasyon.ilce_adi} Bölgesinde Sunduğumuz Hizmetler
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hizmetler.map((hizmet, index) => (
              <motion.div
                key={hizmet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/hizmetler/${hizmet.slug}`}>
                  <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {(hizmet.cloudinary_url || hizmet.resim_url) ? (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={hizmet.cloudinary_url || hizmet.resim_url}
                          alt={hizmet.hizmet_adi}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {hizmet.hizmet_adi}
                      </h3>
                      {hizmet.kategori && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                          {hizmet.kategori}
                        </span>
                      )}
                      {hizmet.aciklama && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {hizmet.aciklama}
                        </p>
                      )}
                      {hizmet.urunler && hizmet.urunler.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Öne Çıkan Ürünler:</h4>
                          <div className="space-y-1">
                            {hizmet.urunler.map((urun) => (
                              <div key={urun.id} className="flex items-center text-xs text-gray-600">
                                {urun.cloudinary_url && (
                                  <img 
                                    src={urun.cloudinary_url} 
                                    alt={urun.urun_adi}
                                    className="w-6 h-6 rounded-full object-cover mr-2"
                                  />
                                )}
                                <span className="truncate">{urun.urun_adi}</span>
                                {urun.fiyat && (
                                  <span className="ml-auto font-medium text-blue-600">
                                    {typeof urun.fiyat === 'number' 
                                      ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(urun.fiyat)
                                      : urun.fiyat
                                    }
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {hizmetler.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Bu lokasyon için henüz hizmet eklenmemiş.</p>
            </div>
          )}
        </div>

        {/* İletişim CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {lokasyon.ilce_adi} Bölgesinde Mühendislik Hizmeti Mi Arıyorsunuz?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Uzman ekibimizle size özel çözümler sunmak için hazırız
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              İletişime Geç
            </Link>
            <Link
              href="/hizmetler"
              className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
            >
              Tüm Hizmetler
            </Link>
          </div>
        </motion.div>

        {/* Diğer Lokasyonlar */}
        <div className="mt-16 text-center">
          <Link
            href="/lokasyonlar"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Tüm Lokasyonlara Dön
          </Link>
        </div>
      </div>
    </div>
  );
}