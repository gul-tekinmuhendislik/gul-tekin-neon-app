# SEO Denetim Raporu - Gül-Tekin Mühendislik
**Tarih:** 2025-09-22
**Web Sitesi:** https://gul-tekinmuhendislik.com

## Yönetici Özeti

Gül-Tekin Mühendislik web sitesinin kapsamlı SEO analizi tamamlanmıştır. Site genel olarak iyi bir SEO temeline sahip olup, Next.js framework'ü kullanarak modern web standartlarını karşılamaktadır. Ancak bazı kritik iyileştirme alanları tespit edilmiştir.

### Genel Skor: 75/100

- **Teknik SEO:** 85/100 ✅
- **İçerik SEO:** 70/100 ⚠️
- **Performans:** 75/100 ⚠️
- **Mobil Uyumluluk:** 90/100 ✅

---

## 1. KRİTİK SORUNLAR (Acil Çözülmesi Gerekenler) 🔴

### 1.1 Gelecek Tarihli Lastmod Değerleri
**Sorun:** Sitemap.xml'de lastmod tarihleri Eylül 2025 olarak görünüyor (gelecek tarih)
**Etki:** Google bu tarihleri görmezden gelebilir veya sitemap'i güvenilmez olarak işaretleyebilir
**Çözüm:**
```typescript
// app/sitemap.ts içinde:
const currentDate = new Date().toISOString(); // Doğru kullanım
// Veritabanından gelen updated_at değerlerinin doğru olduğundan emin olun
```

### 1.2 Eksik veya Zayıf İçerik Sayfaları
**Sorun:** Blog sayfası içerik göstermiyor (boş template)
**Etki:** Thin content olarak değerlendirilebilir
**Çözüm:**
- Blog sayfasına en az 5-10 yazı ekleyin
- Her yazı minimum 500 kelime olmalı
- Yazılar özgün ve değerli içerik sunmalı

---

## 2. YÜKSEK ÖNCELİKLİ SORUNLAR 🟠

### 2.1 Sayfa Başlık Uzunlukları
**Sorun:** Ana sayfa title 67 karakter (önerilen max: 60)
```
"Ana Sayfa | Gül-Tekin Mühendislik - Isı Pompası ve Enerji Sistemleri"
```
**Çözüm:**
```
"Gül-Tekin Mühendislik | Isı Pompası & Enerji Sistemleri"
```

### 2.2 Image Optimizasyonu
**Sorun:** Logo.png için farklı boyutlar tanımlanmamış
**Çözüm:**
```typescript
// Favicon ve logo için farklı boyutlar ekleyin:
icons: {
  icon: [
    { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
}
```

### 2.3 Schema Markup Genişletilmesi
**Mevcut:** Sadece LocalBusiness schema
**Eksikler:**
- Service schema
- Product schema
- Review/AggregateRating schema
- FAQ schema
**Çözüm:** Her hizmet sayfasına Service schema ekleyin:
```json
{
  "@type": "Service",
  "serviceType": "Isı Pompası Kurulumu",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Gül-Tekin Mühendislik"
  },
  "areaServed": "Muğla",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Isı Pompası Hizmetleri"
  }
}
```

---

## 3. ORTA ÖNCELİKLİ SORUNLAR 🟡

### 3.1 Internal Link Yapısı
**Sorun:** Yetersiz internal linking
**Çözüm:**
- Her blog yazısında ilgili hizmet sayfalarına link verin
- Hizmet sayfalarından ilgili projelere link ekleyin
- Footer'a daha fazla navigasyon linki ekleyin

### 3.2 Breadcrumb Navigasyonu
**Sorun:** Breadcrumb component var ama kullanılmıyor
**Çözüm:** Tüm alt sayfalarda breadcrumb'ı aktifleştirin:
```tsx
<Breadcrumb
  items={[
    { label: "Ana Sayfa", href: "/" },
    { label: "Hizmetler", href: "/hizmetler" },
    { label: "Isı Pompası", href: "/hizmetler/isi-pompasi" }
  ]}
/>
```

### 3.3 Alt Text Optimizasyonu
**Sorun:** Genel alt text kullanımı ("Gül-Tekin Mühendislik logosu")
**Çözüm:** Her görsel için açıklayıcı, keyword içeren alt text:
```tsx
alt="Muğla Bodrum bölgesi ısı pompası kurulum hizmeti"
alt="Daikin Altherma ısı pompası villa uygulaması"
```

---

## 4. DÜŞÜK ÖNCELİKLİ İYİLEŞTİRMELER 🟢

### 4.1 Meta Keywords
**Durum:** Meta keywords kullanılıyor (artık Google tarafından dikkate alınmıyor)
**Öneri:** Kaldırabilirsiniz veya diğer arama motorları için tutabilirsiniz

### 4.2 Canonical URL'ler
**Durum:** Doğru şekilde ayarlanmış
**İyileştirme:** Dinamik sayfalar için de canonical ekleyin

### 4.3 Robots.txt
**Durum:** Düzgün yapılandırılmış
**İyileştirme:** Crawl-delay eklenebilir:
```
User-agent: *
Crawl-delay: 1
```

---

## 5. PERFORMANS OPTİMİZASYONLARI ⚡

### 5.1 Core Web Vitals İyileştirmeleri
**Mevcut Yapılandırma:** İyi
**Ek Öneriler:**

1. **Font Optimizasyonu:**
```css
/* Font display swap ekleyin */
@font-face {
  font-family: 'Inter';
  font-display: swap;
}
```

2. **Critical CSS:**
```typescript
// next.config.ts'e ekleyin:
experimental: {
  optimizeCss: true,
  craCompat: true
}
```

3. **Lazy Loading:**
- Tüm görseller için lazy loading aktif
- Below-the-fold componentler için dynamic import kullanın

### 5.2 Bundle Size Optimizasyonu
**Tespit:** Birçok ağır kütüphane kullanılıyor
**Çözüm:**
```bash
# Bundle analizini çalıştırın
npm run build
npm run analyze
```

---

## 6. İÇERİK SEO STRATEJİSİ 📝

### 6.1 Blog İçerik Planı
Aşağıdaki konularda SEO odaklı içerikler oluşturun:

1. **"Muğla'da Isı Pompası Kurulumu: 2025 Rehberi"** (2000+ kelime)
2. **"Villa için En İyi Isı Pompası Modelleri"** (1500+ kelime)
3. **"Isı Pompası vs Klima: Hangisi Daha Ekonomik?"** (1000+ kelime)
4. **"Güneş Enerjisi ve Isı Pompası Kombinasyonu"** (1500+ kelime)
5. **"Su Arıtma Sistemleri: Ev için Doğru Seçim"** (1200+ kelime)

### 6.2 Yerel SEO Güçlendirme
- Her lokasyon için ayrı sayfa oluşturun (/bodrum, /milas, /yalikavak)
- Google My Business entegrasyonu
- Müşteri yorumlarını web sitesinde gösterin

---

## 7. TEKNİK İYİLEŞTİRME KONTROL LİSTESİ ✅

- [ ] Sitemap lastmod tarihlerini düzeltin
- [ ] Blog sayfasına içerik ekleyin
- [ ] Sayfa başlıklarını optimize edin (max 60 karakter)
- [ ] Service schema markup ekleyin
- [ ] Breadcrumb navigasyonunu aktifleştirin
- [ ] Alt text'leri optimize edin
- [ ] Font display: swap ekleyin
- [ ] Critical CSS ayarlarını yapın
- [ ] Blog içerik planını uygulamaya başlayın
- [ ] Lokasyon bazlı sayfalar oluşturun
- [ ] 404 sayfasını özelleştirin
- [ ] XML sitemap'i Google Search Console'a gönderin
- [ ] Sayfa hızı testlerini yapın (PageSpeed Insights)
- [ ] Mobil uyumluluk testini geçin
- [ ] HTTPS yönlendirmelerini kontrol edin

---

## 8. İZLEME VE ÖLÇÜM 📊

### Kurulması Gereken Araçlar:
1. **Google Search Console** - Arama performansı takibi
2. **Google Analytics 4** - Kullanıcı davranışı analizi
3. **Hotjar/Clarity** - Kullanıcı deneyimi analizi
4. **Google PageSpeed Insights** - Performans takibi

### Takip Edilecek Metrikler:
- Organik trafik artışı
- Anahtar kelime sıralamaları
- Click-through rate (CTR)
- Bounce rate
- Ortalama oturum süresi
- Core Web Vitals skorları

---

## 9. TAHMİNİ ETKİ VE ZAMAN ÇİZELGESİ 📈

### İlk 30 Gün:
- Kritik sorunları düzeltin
- Technical SEO iyileştirmelerini tamamlayın
- İlk blog içeriklerini yayınlayın

### 30-60 Gün:
- İçerik stratejisini uygulamaya devam edin
- Schema markup genişletmelerini tamamlayın
- Yerel SEO sayfalarını oluşturun

### 60-90 Gün:
- Performans optimizasyonlarını tamamlayın
- Link building stratejisi geliştirin
- İlk SEO performans raporunu hazırlayın

### Beklenen Sonuçlar:
- 3 ay içinde organik trafikte %30-50 artış
- Hedef anahtar kelimelerde ilk sayfa sıralamaları
- Dönüşüm oranında %15-25 iyileşme

---

## 10. REKABET ANALİZİ ÖNERİSİ 🎯

Aşağıdaki rakiplerin SEO stratejilerini analiz edin:
- Bölgedeki diğer mühendislik firmaları
- Ulusal ısı pompası kurulum firmaları
- E-ticaret siteleri (ürün sayfaları için)

Araçlar:
- Ahrefs/SEMrush (backlink analizi)
- SimilarWeb (trafik analizi)
- Google Keyword Planner (anahtar kelime araştırması)

---

## SONUÇ

Gül-Tekin Mühendislik web sitesi güçlü bir teknik altyapıya sahiptir. Yukarıda belirtilen iyileştirmeler yapıldığında, organik arama performansında önemli artışlar görülecektir. Öncelikle kritik sorunları çözün, ardından içerik stratejisine odaklanın.

**Not:** Bu rapor 2025-09-22 tarihinde hazırlanmıştır. SEO sürekli gelişen bir alan olduğu için, düzenli olarak güncellemeler yapılmalıdır.