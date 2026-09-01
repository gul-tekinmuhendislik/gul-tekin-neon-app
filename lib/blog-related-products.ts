/**
 * Blog içeriğinden ilgili ürünleri bul
 */
export function findRelatedProducts(content: string, products: Array<{
  id: string | number;
  urun_adi: string;
  slug: string;
  marka?: string;
  kategori?: string;
  cloudinary_url?: string;
  gorsel_url?: string;
}>): Array<{ id: string | number; urun_adi: string; slug: string; marka?: string; kategori?: string; cloudinary_url?: string; gorsel_url?: string; matchScore: number }> {
  const contentLower = content.toLowerCase();
  const related: Array<{ id: string | number; urun_adi: string; slug: string; marka?: string; kategori?: string; cloudinary_url?: string; gorsel_url?: string; matchScore: number }> = [];

  for (const product of products) {
    let score = 0;
    const urunAdiLower = product.urun_adi.toLowerCase();
    const markaLower = product.marka?.toLowerCase() || '';
    const kategoriLower = product.kategori?.toLowerCase() || '';

    // Marka adı içerde geçiyorsa puan ekle
    if (markaLower && contentLower.includes(markaLower)) {
      score += 3;
    }

    // Kategori adı içerde geçiyorsa puan ekle
    if (kategoriLower && contentLower.includes(kategoriLower)) {
      score += 2;
    }

    // Ürün serisi ismi içerde geçiyorsa puan ekle (Varm Up, Varm Boost vb.)
    const seriesMatch = product.urun_adi.match(/(Varm \w+|Commercial \w+|Silent Pool)/i);
    if (seriesMatch && contentLower.includes(seriesMatch[1].toLowerCase())) {
      score += 4;
    }

    // Tam ürün adı içerde geçiyorsa yüksek puan
    if (contentLower.includes(urunAdiLower)) {
      score += 10;
    }

    // Kapasite eşleşmesi (23kW, 35kW vb.)
    const capacityMatch = product.urun_adi.match(/(\d+)\s*kw/i);
    if (capacityMatch && contentLower.includes(capacityMatch[0])) {
      score += 5;
    }

    if (score > 0) {
      related.push({ ...product, matchScore: score });
    }
  }

  // Puana göre sırala ve ilk 6 ürünü döndür
  return related
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}
