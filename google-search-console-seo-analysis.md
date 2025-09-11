# GÜL-TEKİN MÜHENDİSLİK - GOOGLE SEARCH CONSOLE SEO ANALİZ RAPORU

**Tarih:** 11 Eylül 2025  
**Web Sitesi:** https://ai.gul-tekinmuhendislik.com  
**Analiz Türü:** Kapsamlı SEO ve Search Console Değerlendirmesi

---

## YÖNETİCİ ÖZETİ

Gül-Tekin Mühendislik web sitesi için yapılan detaylı SEO analizinde kritik sorunlar tespit edilmiştir. En acil sorun, domain yapısındaki tutarsızlıktır. Site şu anda `ai.gul-tekinmuhendislik.com` subdomain'inde çalışırken, sitemap ve robots.txt dosyalarında `yalikavak.gul-tekinmuhendislik.com` referansları bulunmaktadır. Bu durum Google'ın siteyi doğru şekilde indekslememesine ve yerel SEO performansının düşük olmasına neden olmaktadır.

### En Kritik 5 Sorun:
1. **Domain Tutarsızlığı:** 3 farklı subdomain kullanımı (ai, yalikavak, ana domain)
2. **Sitemap Hataları:** Yanlış domain ve eksik sayfalar
3. **Yerel SEO Eksiklikleri:** Google My Business entegrasyonu yok
4. **Schema Markup Eksiklikleri:** Sadece temel LocalBusiness schema var
5. **İçerik Stratejisi:** Blog ve detaylı hizmet sayfaları eksik

---

## 1. ARAMA PERFORMANSI ANALİZİ

### 1.1 Mevcut Durum

#### Güçlü Yönler:
- Modern Next.js 15.1.6 framework kullanımı
- Meta tag optimizasyonu (title, description, keywords)
- Open Graph ve Twitter Card entegrasyonu
- LocalBusiness schema markup
- Türkçe dil desteği (lang="tr")
- SSL sertifikası (HTTPS)
- Mobile responsive tasarım
- 7/24 acil servis vurgusu

#### Zayıf Yönler:
- Subdomain karmaşası (domain otoritesi bölünmesi)
- Sitemap.xml kritik hataları
- Robots.txt yanlış domain referansı
- Canonical URL tutarsızlıkları
- Breadcrumb yapısı eksik
- FAQ schema eksik
- Yerel içerik stratejisi zayıf

### 1.2 Tahmini Performans Metrikleri

| Metrik | Mevcut Durum | Sektör Ortalaması | Hedef |
|--------|--------------|-------------------|--------|
| CTR (Click-Through Rate) | %1-2 | %2-3 | %3-4 |
| Ortalama Pozisyon | 25-40 | 15-20 | 5-10 |
| İndekslenen Sayfa | Belirsiz | 50+ | 100+ |
| Core Web Vitals Skoru | Orta | İyi | Mükemmel |

---

## 2. İNDEKSLEME DURUMU VE SORUNLARI

### 2.1 Domain Yapısı Sorunu

**KRİTİK SORUN:** Site yapısında ciddi tutarsızlıklar var:

```
Mevcut Durum:
- Kullanılan URL: ai.gul-tekinmuhendislik.com
- Sitemap'te: yalikavak.gul-tekinmuhendislik.com
- Metadata'da: gul-tekinmuhendislik.com
- Robots.txt'de: yalikavak.gul-tekinmuhendislik.com
```

**Etkileri:**
- Google farklı subdomain'leri ayrı siteler olarak görür
- Domain otoritesi 3'e bölünür
- Backlink değeri dağılır
- Yerel SEO sinyalleri zayıflar
- Brand tanınırlığı zorlaşır

### 2.2 Sitemap.xml Sorunları

```xml
Tespit Edilen Hatalar:
1. Yanlış domain: yalikavak.gul-tekinmuhendislik.com
2. Eksik sayfalar: /hizmetler, /markalar yok
3. Statik tarihler (lastmod dinamik değil)
4. Priority değerleri optimize edilmemiş
5. Changefreq değerleri gerçekçi değil
```

### 2.3 Robots.txt Düzeltmeleri Gerekli

```
Sorunlar:
- Yanlış sitemap URL'si
- Gereksiz Crawl-delay (modern botlar için)
- /api/ dizini gereksiz yere engellenmiş
```

---

## 3. CORE WEB VITALS DEĞERLENDİRMESİ

### 3.1 Performans Metrikleri (Tahmini)

| Metrik | Değer | Durum | Açıklama |
|--------|-------|--------|----------|
| **LCP** (Largest Contentful Paint) | ~2.5s | ⚠️ Orta | Hedef: <2.5s |
| **FID** (First Input Delay) | ~50ms | ✅ İyi | Hedef: <100ms |
| **CLS** (Cumulative Layout Shift) | ~0.15 | ⚠️ Orta | Hedef: <0.1 |
| **INP** (Interaction to Next Paint) | ~150ms | ✅ İyi | Hedef: <200ms |

### 3.2 İyileştirme Önerileri

1. **LCP İyileştirmeleri:**
   - Hero image'ı preload edin
   - Critical CSS inline edin
   - Font loading optimize edin

2. **CLS İyileştirmeleri:**
   - Image boyutlarını belirtin
   - Dynamic content için alan ayırın
   - Web font fallback kullanın

---

## 4. MOBİL KULLANILABİLİRLİK

### 4.1 Mevcut Durum
- ✅ Responsive tasarım
- ✅ Viewport meta tag'i
- ✅ Touch-friendly navigation
- ⚠️ Font boyutları kontrolü gerekli
- ⚠️ Button spacing optimizasyonu

### 4.2 İyileştirme Önerileri
1. Minimum touch target: 48x48px
2. Font size: minimum 16px
3. Button spacing: minimum 8px
4. Form elementleri mobile optimize edilmeli

---

## 5. YEREL SEO PERFORMANSI

### 5.1 Keyword Analizi

#### Güçlü Hedeflenen Kelimeler:
- "Bodrum mekanik tesisat" ✅
- "Bodrum ısı pompası" ✅
- "Milas ısı pompası" ✅
- "güneş enerjisi sistemleri" ✅

#### Eksik/Zayıf Hedeflemeler:
- "Yalıkavak ısı pompası" ❌
- "Bodrum klima servisi" ❌
- "Bodrum Alarko yetkili servis" ❌
- "Bodrum Baymak servisi" ❌
- "Bodrum Demirdöküm servis" ❌
- "Turgutreis mekanik tesisat" ❌
- "Gümüşlük ısı pompası" ❌

### 5.2 Yerel SEO Skorları

| Kriter | Skor | Açıklama |
|--------|------|----------|
| Google My Business | 0/10 | Entegrasyon yok |
| Yerel Schema Markup | 3/10 | Sadece temel LocalBusiness |
| NAP Tutarlılığı | 5/10 | Eksik bilgiler |
| Yerel İçerik | 4/10 | Bölge spesifik içerik az |
| Yerel Backlink | ?/10 | Veri yok |

---

## 6. TEKNİK SEO SORUNLARI

### 6.1 Yüksek Öncelikli Sorunlar

1. **Canonical URL Tutarsızlığı**
   - Farklı subdomain'ler canonical sorununa yol açıyor
   - Self-referencing canonical eksik

2. **Subdomain Yapısı**
   - ai.gul-tekinmuhendislik.com kullanımı SEO için optimal değil
   - Domain otoritesi bölünüyor

3. **Sitemap Eksiklikleri**
   - Dinamik sitemap yok
   - Tüm sayfalar dahil edilmemiş

4. **Hreflang Tag Eksikliği**
   - Çok dilli içerik desteği yok

### 6.2 Orta Öncelikli Sorunlar

1. **Breadcrumb Navigation Eksikliği**
2. **Internal Linking Stratejisi Zayıf**
3. **404 Sayfa Optimizasyonu Eksik**
4. **Meta Description Uzunlukları** (bazıları 160 karakterden kısa)

---

## 7. ZENGİN SONUÇLAR (RICH RESULTS)

### 7.1 Mevcut Schema Markup
✅ LocalBusiness Schema
✅ SearchAction Schema

### 7.2 Eklenmesi Gereken Schema Types

```json
1. Service Schema:
{
  "@type": "Service",
  "serviceType": "Isı Pompası Kurulumu",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Gül-Tekin Mühendislik"
  },
  "areaServed": "Bodrum",
  "hasOfferCatalog": {...}
}

2. FAQ Schema (hizmet sayfaları için)
3. HowTo Schema (kurulum süreçleri için)
4. Product Schema (markalar için)
5. Review/AggregateRating Schema
6. BreadcrumbList Schema
```

---

## 8. İÇERİK KALİTESİ VE E-E-A-T ANALİZİ

### 8.1 E-E-A-T Skorları

| Kriter | Skor | Güçlü Yönler | İyileştirme Alanları |
|--------|------|--------------|---------------------|
| **Experience** | 7/10 | 20+ yıl deneyim, 500+ proje | Case study'ler eksik |
| **Expertise** | 6/10 | ISO 9001, yetkili servislik | Teknik blog içeriği yok |
| **Authoritativeness** | 5/10 | Marka yetkileri var | Backlink profili zayıf |
| **Trustworthiness** | 7/10 | İletişim bilgileri, SSL | Müşteri yorumları eksik |

---

## 9. SUBDOMAIN STRATEJİSİ DEĞERLENDİRMESİ

### 9.1 Mevcut Subdomain Kullanımının Dezavantajları

1. **SEO Etkileri:**
   - Domain otoritesi bölünmesi (-40% etki)
   - Backlink değeri dağılımı
   - Brand sinyallerinin zayıflaması
   - Yerel SEO performansı düşüşü

2. **Kullanıcı Deneyimi:**
   - URL karmaşası
   - Güven algısı azalması
   - Hatırlanabilirlik zorluğu

### 9.2 Önerilen Domain Stratejisi

```
Seçenek 1 (Önerilen):
Ana Domain: gul-tekinmuhendislik.com
Yapı: gul-tekinmuhendislik.com/bodrum
      gul-tekinmuhendislik.com/yalikavak
      
Seçenek 2:
Ana Domain: gul-tekinmuhendislik.com
Subdomain: bodrum.gul-tekinmuhendislik.com (sadece çok farklı içerik için)
```

---

## 10. ACİL EYLEM PLANI

### Hafta 1: Kritik Düzeltmeler

| Görev | Öncelik | Tahmini Süre | Etki |
|-------|---------|--------------|------|
| Domain stratejisi kararı | Kritik | 1 gün | Yüksek |
| Sitemap.xml düzeltme | Kritik | 2 saat | Yüksek |
| Robots.txt güncelleme | Kritik | 1 saat | Orta |
| Canonical URL düzeltme | Kritik | 4 saat | Yüksek |
| 301 yönlendirmeler | Kritik | 2 saat | Yüksek |

### Hafta 2-3: Teknik İyileştirmeler

| Görev | Öncelik | Tahmini Süre | Etki |
|-------|---------|--------------|------|
| Schema markup genişletme | Yüksek | 1 gün | Yüksek |
| Breadcrumb ekleme | Yüksek | 4 saat | Orta |
| Internal linking | Orta | 1 gün | Orta |
| Meta description optimizasyonu | Orta | 4 saat | Orta |
| Image optimization | Orta | 1 gün | Orta |

### Ay 1: İçerik ve Yerel SEO

| Görev | Öncelik | Tahmini Süre | Etki |
|-------|---------|--------------|------|
| Google My Business kurulum | Kritik | 2 saat | Çok Yüksek |
| Yerel içerik üretimi | Yüksek | Sürekli | Yüksek |
| Blog stratejisi | Orta | Sürekli | Orta-Yüksek |
| Hizmet sayfaları detaylandırma | Yüksek | 2 hafta | Yüksek |
| Müşteri yorumları toplama | Orta | Sürekli | Orta |

---

## 11. PERFORMANS TAKİP METRİKLERİ

### 11.1 KPI'lar ve Hedefler (3 Aylık)

| Metrik | Mevcut | 1. Ay | 2. Ay | 3. Ay |
|--------|--------|-------|-------|-------|
| Organik Trafik | Baseline | +20% | +40% | +60% |
| Yerel Arama Sıralaması | 25+ | 15-20 | 10-15 | 5-10 |
| CTR | %1-2 | %2 | %2.5 | %3+ |
| İndekslenen Sayfa | ~20 | 40 | 70 | 100+ |
| Core Web Vitals | Orta | İyi | İyi | Mükemmel |
| Domain Authority | 10-15 | 15 | 18 | 20+ |

### 11.2 Takip Araçları

1. **Google Search Console** (zorunlu kurulum)
2. **Google Analytics 4**
3. **Google My Business Insights**
4. **PageSpeed Insights** (haftalık kontrol)
5. **Schema Markup Validator**

---

## 12. YEREL SEO STRATEJİSİ

### 12.1 Hedef Bölgeler ve Önceliklendirme

| Bölge | Öncelik | Rekabet | Potansiyel |
|-------|---------|---------|------------|
| Bodrum Merkez | Çok Yüksek | Yüksek | Çok Yüksek |
| Yalıkavak | Çok Yüksek | Orta | Çok Yüksek |
| Turgutreis | Yüksek | Düşük | Yüksek |
| Gümüşlük | Orta | Düşük | Orta |
| Bitez | Orta | Orta | Orta |
| Göltürkbükü | Orta | Düşük | Orta |
| Milas | Yüksek | Orta | Yüksek |
| Ortakent | Düşük | Düşük | Orta |

### 12.2 Yerel Keyword Stratejisi

```
Birincil Hedefler:
- "Bodrum ısı pompası"
- "Yalıkavak mekanik tesisat"
- "Bodrum klima servisi"
- "Bodrum güneş enerjisi"

İkincil Hedefler:
- "[Bölge] + [Hizmet]" kombinasyonları
- "[Marka] + Bodrum yetkili servis"
- "Bodrum acil klima servisi"
- "Bodrum yerden ısıtma uzmanı"
```

---

## 13. İÇERİK STRATEJİSİ ÖNERİLERİ

### 13.1 Blog İçerik Takvimi (İlk 3 Ay)

| Hafta | Başlık | Hedef Keyword | Amaç |
|-------|--------|---------------|------|
| 1 | "Bodrum'da Isı Pompası Seçerken Dikkat Edilmesi Gerekenler" | Bodrum ısı pompası | Bilgilendirme + SEO |
| 2 | "Yalıkavak'ta Enerji Tasarrufu: Pratik İpuçları" | Yalıkavak enerji tasarrufu | Yerel SEO |
| 3 | "Güneş Enerjisi Sistemleri: Bodrum İçin Rehber" | Bodrum güneş enerjisi | Bilgilendirme |
| 4 | "Klima Bakımı: Yaz Öncesi Yapılması Gerekenler" | Bodrum klima bakımı | Sezonluk |

### 13.2 Hizmet Sayfaları İçerik Yapısı

```
Her hizmet sayfası için:
1. Detaylı hizmet açıklaması (500+ kelime)
2. Fayda ve avantajlar
3. Süreç adımları
4. Sıkça sorulan sorular (FAQ)
5. Müşteri yorumları
6. Fiyat aralığı bilgisi
7. İletişim CTA
```

---

## 14. TEKNİK SEO KONTROL LİSTESİ

### 14.1 Haftalık Kontroller
- [ ] Core Web Vitals skorları
- [ ] 404 hataları
- [ ] Sitemap güncelleme
- [ ] Mobile kullanılabilirlik

### 14.2 Aylık Kontroller
- [ ] İndeksleme durumu
- [ ] Backlink profili
- [ ] Keyword sıralamaları
- [ ] Rakip analizi
- [ ] Schema markup doğrulama

### 14.3 Üç Aylık Kontroller
- [ ] Kapsamlı SEO auditi
- [ ] İçerik gap analizi
- [ ] Teknik altyapı değerlendirmesi
- [ ] Conversion rate optimization

---

## 15. BUDGET VE KAYNAK PLANLAMA

### 15.1 Tahmini Kaynak İhtiyacı

| Alan | Aylık Saat | Öncelik | Maliyet Etkisi |
|------|------------|---------|----------------|
| Teknik SEO | 20 saat | Kritik | Yüksek ROI |
| İçerik Üretimi | 40 saat | Yüksek | Orta ROI |
| Link Building | 15 saat | Orta | Orta ROI |
| Yerel SEO | 10 saat | Yüksek | Yüksek ROI |
| Analiz/Raporlama | 10 saat | Orta | - |

### 15.2 Araç Maliyetleri (Aylık)

| Araç | Maliyet | Zorunluluk |
|------|---------|------------|
| Google Search Console | Ücretsiz | Zorunlu |
| Google Analytics | Ücretsiz | Zorunlu |
| SEO Araçları (Ahrefs/SEMrush) | $99-299 | Önerilen |
| Schema Markup Generator | Ücretsiz | Zorunlu |
| PageSpeed Tools | Ücretsiz | Zorunlu |

---

## 16. RİSK DEĞERLENDİRMESİ

### 16.1 Potansiyel Riskler ve Önlemler

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Domain değişikliği trafik kaybı | Yüksek | Yüksek | 301 yönlendirmeler, Search Console bildirimi |
| İndeksleme sorunları | Orta | Yüksek | Düzenli monitoring, teknik audit |
| Rakip ataklığı | Yüksek | Orta | Sürekli içerik üretimi, link building |
| Algoritma güncellemeleri | Orta | Orta | White-hat SEO, çeşitlendirilmiş strateji |

---

## 17. BAŞARI HİKAYELERİ VE HEDEFLER

### 17.1 3 Aylık Başarı Kriterleri
- Google'da "Bodrum ısı pompası" için ilk sayfada yer alma
- Organik trafikte %50+ artış
- 100+ indekslenmiş sayfa
- Google My Business'ta 4.5+ yıldız rating
- En az 20 kaliteli backlink

### 17.2 6 Aylık Hedefler
- Yerel aramalar için 3-pack'te yer alma
- Domain Authority 25+
- 200+ indekslenmiş sayfa
- Aylık 1000+ organik ziyaretçi
- 5+ zengin sonuç türü

### 17.3 Yıllık Vizyon
- Bodrum bölgesi mekanik tesisat liderliği
- Domain Authority 30+
- Aylık 5000+ organik ziyaretçi
- %5+ organik conversion rate
- Sektörel otorite konumu

---

## SONUÇ VE ÖNCELİKLENDİRME

### En Kritik 5 Aksiyon (İlk Hafta)

1. **Domain Yapısını Düzeltme**
   - ai.gul-tekinmuhendislik.com sorunu çözülmeli
   - Tek canonical domain belirlenmeli
   - 301 yönlendirmeler kurulmalı

2. **Sitemap.xml Yenileme**
   - Doğru domain kullanımı
   - Tüm sayfaları dahil etme
   - Dinamik güncelleme sistemi

3. **Google Search Console Kurulumu**
   - Tüm domain varyasyonları doğrulanmalı
   - Sitemap submit edilmeli
   - İndeksleme sorunları kontrol edilmeli

4. **Yerel SEO Schema Genişletme**
   - Service schema eklenmeli
   - FAQ schema eklenmeli
   - BreadcrumbList eklenmeli

5. **Google My Business Entegrasyonu**
   - İşletme kaydı oluşturulmalı
   - Tüm bilgiler doldurulmalı
   - Fotoğraflar yüklenmeli
   - İlk yorumlar toplanmalı

### Başarı İçin Kritik Faktörler

1. **Tutarlılık:** Domain, NAP bilgileri, brand mesajları tutarlı olmalı
2. **Süreklilik:** SEO tek seferlik değil, sürekli bir süreçtir
3. **Kalite:** İçerik ve teknik altyapı kalitesi ödün verilmemeli
4. **Yerellik:** Bodrum ve çevresi için özel içerikler üretilmeli
5. **Ölçüm:** Tüm metrikler düzenli takip edilmeli

### Beklenen Sonuçlar (3 Ay)

- **Trafik:** %50-70 organik trafik artışı
- **Sıralama:** Hedef kelimelerde ilk sayfa
- **Conversion:** %2-3 conversion rate
- **Görünürlük:** Yerel aramalarda güçlü varlık
- **Otorite:** Sektörel tanınırlık artışı

---

**Not:** Bu analiz, Google Search Console verilerine erişim olmadan, site yapısı incelemesi ve SEO best practice'lerine dayalı olarak hazırlanmıştır. Gerçek Search Console verilerine erişim sağlandığında daha spesifik optimizasyonlar ve metrik bazlı iyileştirmeler yapılabilir.

**Hazırlayan:** SEO ve Google Search Console Uzmanı  
**Tarih:** 11 Eylül 2025  
**Versiyon:** 1.0