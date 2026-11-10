import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getListingImageUrl } from "@/lib/utils/image-optimization";
import {
  getAllUrunler,
  getUrunCategories,
  getUrunBrands,
  type Urun,
} from "@/lib/static-data";

export const revalidate = 3600;

interface Product extends Urun {}

interface ProductsPageProps {
  searchParams?: Promise<{
    page?: string;
    kategori?: string;
    marka?: string;
    search?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = (await searchParams) || {};
  const currentPage = parseInt(params.page || "1");
  const selectedCategory = params.kategori as string | undefined;
  const selectedBrand = params.marka as string | undefined;
  const searchQuery = params.search as string | undefined;

  const queryParams = new URLSearchParams();
  if (currentPage > 1) queryParams.set("page", currentPage.toString());
  if (selectedCategory) queryParams.set("kategori", selectedCategory);
  if (selectedBrand) queryParams.set("marka", selectedBrand);
  if (searchQuery) queryParams.set("search", searchQuery);

  const queryString = queryParams.toString();
  const baseUrl = "https://gul-tekinmuhendislik.com/urunler";
  const canonicalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  let title = "Ürünler - Gül-Tekin Mühendislik";
  if (currentPage > 1) {
    title = `Ürünler (Sayfa ${currentPage}) - Gül-Tekin Mühendislik`;
  }
  if (selectedCategory) {
    title = `${selectedCategory} Ürünleri${currentPage > 1 ? ` (Sayfa ${currentPage})` : ""} - Gül-Tekin Mühendislik`;
  }

  let description =
    "Gül-Tekin Mühendislik olarak sunduğumuz ürünler ve çözümler. Isı pompaları, güneş enerjisi sistemleri, su arıtma ve mekanik tesisat ürünleri.";
  if (currentPage > 1) {
    description = `Ürünlerimiz sayfa ${currentPage}. Isı pompaları, güneş enerjisi, su arıtma sistemleri ve daha fazlası.`;
  }
  if (selectedCategory) {
    description = `${selectedCategory} kategorisindeki ürünlerimiz${currentPage > 1 ? ` - Sayfa ${currentPage}` : ""}. Kaliteli ve güvenilir çözümler.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

const PRODUCTS_PER_PAGE = 24;

function filterProducts(
  products: Product[],
  kategori?: string,
  marka?: string,
  search?: string,
): Product[] {
  return products.filter((p) => {
    if (kategori && p.kategori !== kategori) return false;
    if (marka && p.marka?.toLowerCase() !== marka.toLowerCase()) return false;
    if (search) {
      const query = search.toLowerCase();
      const haystack = `${p.urun_adi || ""} ${p.aciklama || ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = (await searchParams) || {};
  const currentPage = parseInt(params.page || "1");
  const selectedCategory = params.kategori;
  const selectedBrand = params.marka;
  const searchQuery = params.search;

  const allProducts = getAllUrunler();
  const filteredProducts = filterProducts(
    allProducts,
    selectedCategory,
    selectedBrand,
    searchQuery,
  );
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const safePage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const offset = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(offset, offset + PRODUCTS_PER_PAGE);

  const categories = getUrunCategories();
  const brands = getUrunBrands();

  const buildPaginationUrl = (page: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    if (selectedCategory) queryParams.set("kategori", selectedCategory);
    if (selectedBrand) queryParams.set("marka", selectedBrand);
    if (searchQuery) queryParams.set("search", searchQuery);
    return `/urunler?${queryParams.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <form method="get" action="/urunler" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ürün Ara
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  defaultValue={searchQuery || ""}
                  placeholder="Ürün adı veya açıklama..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="kategori"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kategori
                </label>
                <select
                  id="kategori"
                  name="kategori"
                  defaultValue={selectedCategory || ""}
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

              <div>
                <label
                  htmlFor="marka"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Marka
                </label>
                <select
                  id="marka"
                  name="marka"
                  defaultValue={selectedBrand || ""}
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

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Filtrele
                </button>
              </div>
            </div>

            {(selectedCategory || selectedBrand || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Aktif Filtreler:</span>
                {searchQuery && (
                  <Link
                    href={buildPaginationUrl(1)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Arama: {searchQuery}
                    <span className="ml-1">×</span>
                  </Link>
                )}
                {selectedCategory && (
                  <Link
                    href={buildPaginationUrl(1)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    {selectedCategory}
                    <span className="ml-1">×</span>
                  </Link>
                )}
                {selectedBrand && (
                  <Link
                    href={buildPaginationUrl(1)}
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

        <div className="mb-6 text-sm text-gray-600">
          Toplam {totalProducts} ürün bulundu.
          {totalPages > 1 && ` (Sayfa ${safePage} / ${totalPages})`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {pageProducts.map((product: Product) => (
            <Link
              key={product.id}
              href={`/urunler/${product.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                {product.cloudinary_url || product.gorsel_url ? (
                  <Image
                    src={getListingImageUrl(
                      product.cloudinary_url || product.gorsel_url || "",
                    )}
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
                <div className="mt-4 flex items-center justify-between">
                  {product.stokta !== undefined && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stokta
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {product.stokta ? "Stokta" : "Stok Dışı"}
                    </span>
                  )}
                  <span className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                    Detaylar
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            {safePage > 1 && (
              <Link
                href={buildPaginationUrl(safePage - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Önceki
              </Link>
            )}

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildPaginationUrl(pageNumber)}
                    className={`px-3 py-2 border rounded-md transition-colors ${
                      pageNumber === safePage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ),
              )}
            </div>

            {safePage < totalPages && (
              <Link
                href={buildPaginationUrl(safePage + 1)}
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
