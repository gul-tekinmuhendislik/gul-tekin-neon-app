'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface FactoryImage {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

interface Brand {
  marka_adi: string;
  slug: string;
  cloudinary_url: string;
}

const STATIC_BRANDS: Brand[] = [
  {
    marka_adi: 'Varmeks',
    slug: 'varmeks',
    cloudinary_url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515968/gul-tekin/varmeks/varmeks-commercial-duo-1.png'
  },
  {
    marka_adi: 'Solimpeks',
    slug: 'solimpeks',
    cloudinary_url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759745039/Solimpeks_Online_ost19m.png'
  }
];

const STATIC_FACTORY_IMAGES: FactoryImage[] = [
  {
    publicId: 'gul-tekin/factory/varmeks-factory-1',
    url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/varmeks-factory-1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/w_400,h_300,c_fill/gul-tekin/factory/varmeks-factory-1.jpg',
    fullUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/varmeks-factory-1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString()
  },
  {
    publicId: 'gul-tekin/factory/solimpeks-factory-1',
    url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/solimpeks-factory-1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/w_400,h_300,c_fill/gul-tekin/factory/solimpeks-factory-1.jpg',
    fullUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/solimpeks-factory-1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString()
  },
  {
    publicId: 'gul-tekin/factory/production-line-1',
    url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/production-line-1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/w_400,h_300,c_fill/gul-tekin/factory/production-line-1.jpg',
    fullUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/production-line-1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString()
  },
  {
    publicId: 'gul-tekin/factory/assembly-area-1',
    url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/assembly-area-1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/w_400,h_300,c_fill/gul-tekin/factory/assembly-area-1.jpg',
    fullUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/assembly-area-1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString()
  },
  {
    publicId: 'gul-tekin/factory/warehouse-1',
    url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/warehouse-1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/w_400,h_300,c_fill/gul-tekin/factory/warehouse-1.jpg',
    fullUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/warehouse-1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString()
  },
  {
    publicId: 'gul-tekin/factory/quality-control-1',
    url: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/quality-control-1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/w_400,h_300,c_fill/gul-tekin/factory/quality-control-1.jpg',
    fullUrl: 'https://res.cloudinary.com/dgfdk0l8j/image/upload/gul-tekin/factory/quality-control-1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString()
  }
];

export default function FabrikaGezisiPage() {
  const [images, setImages] = useState<FactoryImage[]>(STATIC_FACTORY_IMAGES);
  const [selectedImage, setSelectedImage] = useState<FactoryImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>(STATIC_BRANDS);

  const openLightbox = (image: FactoryImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    const currentIndex = images.findIndex(img => img.publicId === selectedImage.publicId);
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImage(images[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">❌ Hata</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Brand Logos */}
            <div className="flex items-center justify-center gap-8 mb-8">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/markalar/${brand.slug}`}
                  className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-[92px] flex items-center"
                >
                  <Image
                    src={brand.cloudinary_url}
                    alt={`${brand.marka_adi} - Yetkili bayii`}
                    width={150}
                    height={60}
                    className="object-contain"
                    unoptimized
                  />
                </Link>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Varmeks & Solimpeks Fabrika Gezisi
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Kaliteli ürünlerimizin üretildiği modern tesislerimizden görüntüler
            </p>
            <div className="mt-6 text-blue-200">
              <p className="text-lg">{images.length} Fotoğraf</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-16">
        {images.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">Henüz fotoğraf eklenmemiş</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <motion.div
                key={image.publicId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => openLightbox(image)}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={image.thumbnailUrl}
                    alt={`Varmeks ve Solimpeks fabrika gezisi - Isı pompası, kombi ve güneş enerjisi üretim tesisleri fotoğrafı ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.fullUrl}
                alt="Varmeks ve Solimpeks fabrika gezisi - Isı pompası, kombi ve güneş enerjisi sistemleri üretim tesisleri"
                fill
                className="object-contain"
                sizes="100vw"
                quality={90}
              />
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
              {images.findIndex(img => img.publicId === selectedImage.publicId) + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
