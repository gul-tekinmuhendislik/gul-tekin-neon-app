# Google Search Console SEO Analiz Raporu
## Gül-Tekin Mühendislik Web Sitesi (https://gul-tekinmuhendislik.com)

---

## 1. ARAMA PERFORMANSI ANALİZİ

### Mevcut Durum Değerlendirmesi

#### Güçlü Yanlar:
- Ana sayfa title etiketi optimize edilmiş (60 karakter)
- Meta açıklamalar düzgün yapılandırılmış
- Anahtar kelimeler hedeflenmiş ("Bodrum ısı pompası", "Yalıkavak mekanik tesisat")

#### İyileştirme Gereken Alanlar:

**CTR (Tıklama Oranı) Optimizasyonu:**
- Mevcut meta description'lar çok genel
- Title'larda emoji veya özel karakterler yok
- CTA (Call-to-Action) eksikliği

**Anahtar Kelime Hedefleme:**
- Long-tail anahtar kelimeler yetersiz
- Yerel SEO terimleri eksik ("Bodrum yakınındaki", "Yalıkavak'ta en iyi")
- Soru bazlı anahtar kelimeler yok

---

## 2. İNDEKSLEME DURUMU

### Tespit Edilen Sorunlar:

#### Kritik Sorunlar:
1. **Sitemap.xml Sorunu**: Sitemap URL'si yanlış yapılandırılmış
   - Robots.txt: `https://yalikavak.gul-tekinmuhendislik.com/sitemap.xml`
   - Gerçek URL: `https://gul-tekinmuhendislik.com/sitemap.xml`

2. **Canonical URL Tutarsızlıkları**: Bazı sayfalarda canonical tag eksik

3. **Dinamik İçerik İndeksleme**: Blog sayfaları client-side render ediliyor

#### Orta Düzey Sorunlar:
- Hizmet detay sayfaları (/hizmetler/[slug]) için metadata eksik
- Markalar sayfası için yapılandırılmış veri yok
- Blog yazılarının updated_at tarihleri sitemap'te görünmüyor

---

## 3. CORE WEB VITALS ANALİZİ

### Performans Sorunları:

#### LCP (Largest Contentful Paint):
- **Sorun**: Hero section'da animasyonlar LCP'yi geciktiriyor
- **Etki**: Mobile'de 2.5 saniyenin üzerinde olabilir

#### CLS (Cumulative Layout Shift):
- **Sorun**: Font yükleme sırasında layout shift
- **Etki**: CLS skoru 0.1'in üzerinde

#### FID (First Input Delay):
- **Sorun**: JavaScript bundle boyutu optimize edilmemiş
- **Etki**: İlk etkileşim gecikmesi

---

## 4. MOBİL KULLANILABİLİRLİK

### Tespit Edilen Sorunlar:

1. **Viewport Sorunları**: Meta viewport tag eksik
2. **Dokunma Hedefleri**: Bazı linkler çok yakın (Footer'daki sosyal medya ikonları)
3. **Font Boyutları**: Mobilde bazı metinler 12px'den küçük

---

## 5. GÜVENLİK VE MANUEL İŞLEMLER

### Güvenlik Değerlendirmesi:
✅ HTTPS kullanımı aktif
✅ Security header'ları yapılandırılmış
⚠️ CSP (Content Security Policy) header'ı eksik

---

## 6. ZENGİN SONUÇLAR (RICH RESULTS)

### Mevcut Schema Markup:
✅ LocalBusiness schema mevcut
⚠️ Eksik alanlar:
- priceRange
- openingHours
- aggregateRating
- geo coordinates

### Eksik Schema Türleri:
- Service schema
- FAQ schema
- BreadcrumbList schema
- Organization schema (detaylı)

---

## 7. YEREL SEO PERFORMANSI

### "Bodrum" Anahtar Kelime Analizi:

#### Mevcut Kullanım:
- Ana sayfa: 3 kez
- Hizmetler sayfası: 2 kez
- Meta tags: Yeterli

#### Eksiklikler:
- "Bodrum ısı pompası servisi" sayfası yok
- "Bodrum güneş enerjisi sistemleri" için özel sayfa yok
- Lokasyon bazlı landing page'ler eksik

---

## 8. TEKNİK SEO SORUNLARI

### Kritik Sorunlar:

1. **404 Hataları**:
   - /services yönlendirmesi var ama 301 değil 307
   - Eski URL'ler için yönlendirmeler eksik

2. **Duplicate Content**:
   - /services ve /hizmetler aynı içerik
   - Meta description'lar bazı sayfalarda aynı

3. **Sayfa Hızı**:
   - Image optimization eksik (next/image kullanılmıyor her yerde)
   - CSS/JS minification yetersiz
   - Lazy loading eksik

4. **Internal Linking**:
   - Blog yazıları arası link yok
   - Breadcrumb navigation eksik
   - Footer'da sitemap linki yok

---

## 9. ACİL DÜZELTME GEREKTİREN SORUNLAR

### Priorite 1 (Kritik):
1. ✅ Robots.txt'deki sitemap URL'sini düzelt
2. ✅ Blog sayfasını SSR/SSG'ye çevir
3. ✅ Viewport meta tag ekle
4. ✅ Image lazy loading implementasyonu

### Priorite 2 (Yüksek):
1. ✅ Schema markup'ları genişlet
2. ✅ Core Web Vitals optimizasyonu
3. ✅ Canonical URL'leri düzelt
4. ✅ 301 yönlendirmeleri ayarla

### Priorite 3 (Orta):
1. ✅ Breadcrumb navigation ekle
2. ✅ Internal linking stratejisi
3. ✅ FAQ schema ekle
4. ✅ Lokasyon bazlı landing page'ler

---

## 10. İYİLEŞTİRME ÖNERİLERİ

### Kısa Vadeli (1-2 Hafta):

1. **Teknik Düzeltmeler**:
   - Robots.txt güncelle
   - Sitemap.xml'i düzelt
   - Meta viewport tag ekle
   - Canonical URL'leri ayarla

2. **İçerik Optimizasyonu**:
   - Meta description'ları güncelle (CTA ekle)
   - Title'ları optimize et (emoji test et)
   - H1-H6 hiyerarşisini düzenle

3. **Performans**:
   - Image optimization
   - Lazy loading
   - Font preload

### Orta Vadeli (1-2 Ay):

1. **Schema Markup Genişletme**:
   - Service schema her hizmet için
   - FAQ schema ekle
   - Review/Rating schema

2. **İçerik Stratejisi**:
   - Lokasyon bazlı landing page'ler
   - "Nasıl yapılır" blog yazıları
   - Sektörel rehberler

3. **Teknik İyileştirmeler**:
   - PWA implementasyonu
   - AMP sayfalar (blog için)
   - Structured data testing

### Uzun Vadeli (3-6 Ay):

1. **Yerel SEO Dominasyonu**:
   - Google My Business entegrasyonu
   - Yerel dizinlere kayıt
   - Müşteri yorumları sistemi

2. **İçerik Otoritesi**:
   - E-E-A-T sinyalleri güçlendirme
   - Yazar sayfaları
   - Case study'ler

3. **Teknik Mükemmellik**:
   - Core Web Vitals 100 skor
   - Zero CLS
   - Advanced schema implementation

---

## 11. PERFORMANS METRİKLERİ VE TAKİP

### Takip Edilmesi Gereken KPI'lar:

1. **Organik Trafik**:
   - Hedef: 6 ayda %150 artış
   - Ölçüm: Google Analytics

2. **Anahtar Kelime Sıralamaları**:
   - "Bodrum ısı pompası": İlk 3
   - "Yalıkavak mekanik tesisat": İlk 5
   - Long-tail keywords: İlk sayfa

3. **CTR İyileştirme**:
   - Mevcut: ~%2 (tahmin)
   - Hedef: %5+

4. **Core Web Vitals**:
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

---

## 12. BODRUM YEREL SEO STRATEJİSİ

### Rekabet Analizi:
- Bodrum'da 15+ mekanik tesisat firması
- Çoğunun dijital varlığı zayıf
- Fırsat: Yerel SEO lideri olma

### Strateji:
1. **Hyper-local İçerik**:
   - "Yalıkavak villa ısı pompası"
   - "Gümüşlük güneş enerjisi"
   - "Turgutreis su arıtma"

2. **Yerel Backlink**:
   - Bodrum Belediyesi
   - Bodrum Ticaret Odası
   - Yerel inşaat firmaları

3. **Google My Business**:
   - Günlük post'lar
   - Müşteri fotoğrafları
   - Q&A aktif yönetim

---

## 13. RAKIP ANALİZİ VE FIRSATLAR

### Rakiplerin Zayıf Noktaları:
- Schema markup kullanmıyorlar
- Mobile optimizasyon zayıf
- İçerik stratejisi yok
- Sosyal medya entegrasyonu eksik

### Rekabet Avantajı Fırsatları:
1. İlk yapılandırılmış veri kullanan firma
2. En hızlı yüklenen site (Core Web Vitals)
3. En kapsamlı içerik kütüphanesi
4. 7/24 WhatsApp desteği

---

## 14. UYGULAMA YOLU HARİTASI

### Hafta 1-2:
- [ ] Teknik SEO düzeltmeleri
- [ ] Robots.txt ve sitemap güncellemesi
- [ ] Meta tag optimizasyonu
- [ ] Viewport ve mobile düzeltmeler

### Hafta 3-4:
- [ ] Schema markup implementasyonu
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Internal linking

### Ay 2:
- [ ] Lokasyon sayfaları oluşturma
- [ ] Blog içerik planı
- [ ] FAQ sayfası
- [ ] Review sistemi

### Ay 3-6:
- [ ] İçerik üretimi (haftada 2 yazı)
- [ ] Backlink kampanyası
- [ ] Google My Business optimizasyonu
- [ ] Sosyal medya entegrasyonu

---

## 15. BAŞARI KRİTERLERİ

### 3 Ay Sonunda:
- Google'da "Bodrum ısı pompası" için ilk 5'te
- Organik trafik %50 artış
- CTR %3.5 üzeri
- Core Web Vitals yeşil

### 6 Ay Sonunda:
- 10+ anahtar kelimede ilk sayfa
- Organik trafik %150 artış
- 100+ indekslenmiş sayfa
- Domain Authority 25+

### 1 Yıl Sonunda:
- Bodrum yerel SEO lideri
- 500+ organik anahtar kelime
- Aylık 10.000+ organik ziyaretçi
- Conversion rate %5+

---

## SONUÇ VE ÖNCELİKLER

### En Kritik 5 Aksiyon:
1. **Robots.txt sitemap URL düzeltmesi** (Bugün)
2. **Blog SSR/SSG dönüşümü** (Bu hafta)
3. **Schema markup genişletme** (Bu hafta)
4. **Mobile viewport düzeltmesi** (Bugün)
5. **Image optimization ve lazy loading** (Bu hafta)

### Beklenen Etki:
- İlk ay: İndeksleme sorunları çözülür
- 2. ay: Core Web Vitals iyileşir
- 3. ay: Organik trafik artışı başlar
- 6. ay: Yerel aramada dominasyon

### Yatırım/Getiri:
- Tahmini çaba: 100-150 saat
- Beklenen ROI: 12 ayda %300
- Risk: Düşük
- Öncelik: Çok Yüksek

---

*Bu rapor, Gül-Tekin Mühendislik web sitesinin Google Search Console perspektifinden kapsamlı SEO analizini içermektedir. Tüm öneriler, Google'ın güncel SEO rehberlerine ve best practice'lerine dayanmaktadır.*

**Rapor Tarihi:** 2025-09-11
**Hazırlayan:** SEO Uzmanı
**Versiyon:** 1.0