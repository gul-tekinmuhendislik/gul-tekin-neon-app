import { sql } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Ürünler - Gül-Tekin Mühendislik",
  description: "Gül-Tekin Mühendislik olarak sunduğumuz ürünler ve çözümler",
};

interface Product {
  id: number;
  urun_adi: string;
  slug: string;
  kategori?: string;
  marka?: string;
  aciklama?: string;
  gorsel_url?: string;
  cloudinary_url?: string;
  fiyat?: number;
  stokta?: boolean;
  ozellikler?: Record<string, unknown>;
  airtable_created_time?: string;
  updated_at?: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const products = await sql`
      SELECT 
        id,
        urun_adi,
        slug,
        kategori,
        marka,
        aciklama,
        gorsel_url,
        cloudinary_url,
        fiyat,
        stokta,
        ozellikler,
        airtable_created_time,
        updated_at
      FROM urunler
      WHERE slug IS NOT NULL
      ORDER BY kategori, urun_adi
    `;
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Group products by category
function groupProductsByCategory(products: Product[]) {
  const grouped: Record<string, Product[]> = {};
  
  products.forEach(product => {
    const category = product.kategori || 'Diğer';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(product);
  });
  
  return grouped;
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Ürünlerimiz</h1>
        <p className="text-gray-600">Henüz ürün bulunmamaktadır.</p>
      </div>
    );
  }
  
  const groupedProducts = groupProductsByCategory(products);
  const categories = Object.keys(groupedProducts).sort();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ürünlerimiz</h1>
        <p className="text-lg text-gray-600 mb-12">
          Gül-Tekin Mühendislik olarak, sektörün önde gelen markalarının kaliteli ürünlerini sizlere sunuyoruz.
        </p>
        
        {/* Categories Navigation */}
        <div className="mb-8 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {category} ({groupedProducts[category].length})
              </a>
            ))}
          </div>
        </div>
        
        {/* Products by Category */}
        {categories.map((category) => (
          <div
            key={category}
            id={category.toLowerCase().replace(/\s+/g, '-')}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groupedProducts[category].map((product) => (
                <Link
                  key={product.id}
                  href={`/urunler/${product.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-50">
                    {(product.cloudinary_url || product.gorsel_url) ? (
                      <Image
                        src={product.cloudinary_url || product.gorsel_url || ''}
                        alt={product.urun_adi}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-24 h-24"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    {product.marka && (
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.urun_adi}
                    </h3>
                    {product.aciklama && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {product.aciklama}
                      </p>
                    )}
                    
                    {/* Price and Stock */}
                    <div className="mt-4 flex items-center justify-between">
                      {product.fiyat && product.fiyat > 0 && (
                        <span className="text-lg font-bold text-gray-900">
                          ₺{product.fiyat.toLocaleString('tr-TR')}
                        </span>
                      )}
                      {product.stokta !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.stokta 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {product.stokta ? 'Stokta' : 'Stok Dışı'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}