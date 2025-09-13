import { sql } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { getListingImageUrl } from "@/lib/utils/image-optimization";

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

interface ProductsPageProps {
  searchParams?: Promise<{
    page?: string;
    kategori?: string;
    marka?: string;
    search?: string;
  }>;
}

const PRODUCTS_PER_PAGE = 24;

async function getProducts(
  page: number = 1,
  kategori?: string,
  marka?: string,
  search?: string
) {
  try {
    // Build WHERE conditions
    const conditions = ['slug IS NOT NULL'];
    const params: (string | number)[] = [];
    
    if (kategori) {
      conditions.push(`kategori = $${params.length + 1}`);
      params.push(kategori);
    }
    
    if (marka) {
      conditions.push(`marka = $${params.length + 1}`);
      params.push(marka);
    }
    
    if (search) {
      conditions.push(`(LOWER(urun_adi) LIKE LOWER($${params.length + 1}) OR LOWER(aciklama) LIKE LOWER($${params.length + 2}))`);
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * PRODUCTS_PER_PAGE;
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM urunler
      WHERE ${whereClause}
    `;
    
    // Get products with pagination
    const productsQuery = `
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
      WHERE ${whereClause}
      ORDER BY kategori, urun_adi
      LIMIT ${PRODUCTS_PER_PAGE}
      OFFSET ${offset}
    `;
    
    // Replace placeholders with actual values
    let finalCountQuery = countQuery;
    let finalProductsQuery = productsQuery;
    
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      finalCountQuery = finalCountQuery.replace(placeholder, typeof param === 'string' ? `'${param}'` : String(param));
      finalProductsQuery = finalProductsQuery.replace(placeholder, typeof param === 'string' ? `'${param}'` : String(param));
    });
    
    const [countResult, productsResult] = await Promise.all([
      sql.unsafe(finalCountQuery),
      sql.unsafe(finalProductsQuery)
    ]);

    const countArray = countResult as unknown as Array<{total: number}>;
    const productsArray = Array.isArray(productsResult) ? productsResult as unknown as Product[] : [];

    const totalProducts = countArray[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    return { products: productsArray, totalProducts, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalProducts: 0, totalPages: 0 };
  }
}

async function getCategories() {
  try {
    const categories = await sql`
      SELECT DISTINCT kategori, COUNT(*) as count
      FROM urunler
      WHERE slug IS NOT NULL AND kategori IS NOT NULL
      GROUP BY kategori
      ORDER BY kategori
    `;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getBrands() {
  try {
    const brands = await sql`
      SELECT DISTINCT marka, COUNT(*) as count
      FROM urunler
      WHERE slug IS NOT NULL AND marka IS NOT NULL
      GROUP BY marka
      ORDER BY marka
    `;
    return Array.isArray(brands) ? brands : [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams || {};
  const currentPage = parseInt(params.page || '1');
  const selectedCategory = params.kategori;
  const selectedBrand = params.marka;
  const searchQuery = params.search;
  
  const [{ products, totalProducts, totalPages }, categories, brands] = await Promise.all([
    getProducts(currentPage, selectedCategory, selectedBrand, searchQuery),
    getCategories(),
    getBrands()
  ]);
  
  if (products.length === 0 && currentPage === 1) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Ürünlerimiz</h1>
        <p className="text-gray-600">Aradığınız kriterlere uygun ürün bulunamadı.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ürünlerimiz</h1>
        <p className="text-lg text-gray-600 mb-8">
          Gül-Tekin Mühendislik olarak, sektörün önde gelen markalarının kaliteli ürünlerini sizlere sunuyoruz.
        </p>
        
        {/* Filters and Search */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <form method="get" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Ara
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Ürün adı veya açıklama..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  id="kategori"
                  name="kategori"
                  defaultValue={selectedCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((cat) => (
                    <option key={cat.kategori} value={cat.kategori}>
                      {cat.kategori} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Brand Filter */}
              <div>
                <label htmlFor="marka" className="block text-sm font-medium text-gray-700 mb-1">
                  Marka
                </label>
                <select
                  id="marka"
                  name="marka"
                  defaultValue={selectedBrand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Markalar</option>
                  {brands.map((brand) => (
                    <option key={brand.marka} value={brand.marka}>
                      {brand.marka} ({brand.count})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filter Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Filtrele
                </button>
              </div>
            </div>
            
            {/* Active Filters */}
            {(selectedCategory || selectedBrand || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Aktif Filtreler:</span>
                {searchQuery && (
                  <Link
                    href={`/urunler?${new URLSearchParams({
                      ...(selectedCategory && { kategori: selectedCategory }),
                      ...(selectedBrand && { marka: selectedBrand })
                    })}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Arama: {searchQuery}
                    <span className="ml-1">×</span>
                  </Link>
                )}
                {selectedCategory && (
                  <Link
                    href={`/urunler?${new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(selectedBrand && { marka: selectedBrand })
                    })}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    {selectedCategory}
                    <span className="ml-1">×</span>
                  </Link>
                )}
                {selectedBrand && (
                  <Link
                    href={`/urunler?${new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(selectedCategory && { kategori: selectedCategory })
                    })}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    {selectedBrand}
                    <span className="ml-1">×</span>
                  </Link>
                )}
                <Link
                  href="/urunler"
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Tümünü Temizle
                </Link>
              </div>
            )}
          </form>
        </div>
        
        {/* Results Info */}
        <div className="mb-6 text-sm text-gray-600">
          Toplam {totalProducts} ürün bulundu. 
          {totalPages > 1 && ` (Sayfa ${currentPage} / ${totalPages})`}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product: Product) => (
            <Link
              key={product.id}
              href={`/urunler/${product.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                {(product.cloudinary_url || product.gorsel_url) ? (
                  <Image
                    src={getListingImageUrl(product.cloudinary_url || product.gorsel_url)}
                    alt={product.urun_adi}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            {/* Previous Button */}
            {currentPage > 1 && (
              <Link
                href={`/urunler?${new URLSearchParams({
                  page: (currentPage - 1).toString(),
                  ...(selectedCategory && { kategori: selectedCategory }),
                  ...(selectedBrand && { marka: selectedBrand }),
                  ...(searchQuery && { search: searchQuery })
                })}`}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Önceki
              </Link>
            )}
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <Link
                    href={`/urunler?${new URLSearchParams({
                      page: '1',
                      ...(selectedCategory && { kategori: selectedCategory }),
                      ...(selectedBrand && { marka: selectedBrand }),
                      ...(searchQuery && { search: searchQuery })
                    })}`}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    1
                  </Link>
                  {currentPage > 4 && <span className="px-2">...</span>}
                </>
              )}
              
              {/* Pages around current */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + i;
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <Link
                      key={pageNum}
                      href={`/urunler?${new URLSearchParams({
                        page: pageNum.toString(),
                        ...(selectedCategory && { kategori: selectedCategory }),
                        ...(selectedBrand && { marka: selectedBrand }),
                        ...(searchQuery && { search: searchQuery })
                      })}`}
                      className={`px-3 py-2 border rounded-md transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                  <Link
                    href={`/urunler?${new URLSearchParams({
                      page: totalPages.toString(),
                      ...(selectedCategory && { kategori: selectedCategory }),
                      ...(selectedBrand && { marka: selectedBrand }),
                      ...(searchQuery && { search: searchQuery })
                    })}`}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </Link>
                </>
              )}
            </div>
            
            {/* Next Button */}
            {currentPage < totalPages && (
              <Link
                href={`/urunler?${new URLSearchParams({
                  page: (currentPage + 1).toString(),
                  ...(selectedCategory && { kategori: selectedCategory }),
                  ...(selectedBrand && { marka: selectedBrand }),
                  ...(searchQuery && { search: searchQuery })
                })}`}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sonraki →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}