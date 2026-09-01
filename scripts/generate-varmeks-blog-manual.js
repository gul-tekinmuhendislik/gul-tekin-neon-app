const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.DATABASE_URL);

const BLOG_POSTS = [
  {
    topic: "Varmeks Varm Up Serisi Isı Pompaları: -30°C'ye Kadar Yüksek Performans",
    title: "Varmeks Varm Up Serisi: -30°C'ye Kadar Çalışan Yerli Isı Pompası",
    slug: "varmeks-varm-up-serisi-30c-kadar",
    metaTitle: "Varmeks Varm Up Serisi: -30°C'ye Kadar Çalışan Yerli Isı Pompası",
    metaDescription: "Varmeks Varm Up Serisi ile -30°C'ye kadar yüksek performans! R32 gaz, DC Inverter, Wi-Fi kontrol. Bodrum ve Milas'ta ısı pompası çözümleri.",
    keywords: ["Varmeks", "Varm Up", "ısı pompası", "-30°C", "R32", "DC Inverter", "Wi-Fi", "Bodrum", "Milas", "Gül-Tekin Mühendislik"],
    content: `## Varmeks Varm Up Serisi: -30°C'ye Kadar Yüksek Performans

**SEO Başlığı:** Varmeks Varm Up Serisi: -30°C'ye Kadar Çalışan Yerli Isı Pompası

**URL Slug:** varmeks-varm-up-serisi-30c-kadar

### Giriş

Varmeks, Türkiye'nin yerli ısı pompası üreticisi olarak sektörde öncü konumdadır. Varm Up Serisi, en soğuk günlerde bile yüksek performans sağlayarak ısıtma ve soğutma ihtiyaçlarınızı karşılar. -30°C'ye kadar çalışma özelliği ile öne çıkan bu seri, Bodrum ve Milas bölgesindeki villa ve konutlar için ideal çözümler sunar.

### Varmeks Varm Up Serisi Nedir?

Varm Up Serisi, havadan suya ısı pompaları olarak bilinir. R32 soğutucu akışkan kullanarak çevre dostu bir çalışma sağlar. DC inverter kompresör teknolojisi sayesinde enerji tasarrufu sağlarken, sessiz çalışma özelliğiyle konforlu bir kullanım sunar.

### Teknik Özellikler

- **Kapasite Aralığı:** 8 kW'dan 35 kW'a kadar
- **Soğutucu Gaz:** R32 (çevre dostu)
- **Çalışma Sıcaklığı:** -30°C'ye kadar
- **COP Değeri:** 4.2 - 4.9 arası
- **Ses Seviyesi:** ≤53-59 dB(A)
- **Kontrol:** Wi-Fi destekli akıllı kontrol
- **Koruma Sınıfı:** IPX4

### Avantajları

Varm Up Serisi'nin başlıca avantajları şunlardır:

1. **Enerji Tasarrufu:** COP değeri 4.9'a kadar çıkar, enerji tüketimini minimize eder
2. **Çevre Dostu:** R32 gazı ile düşük karbon emisyonu
3. **Sessiz Çalışma:** 53 dB(A) ile sessiz operasyon
4. **Akıllı Kontrol:** Wi-Fi ile uzaktan yönetim
5. **Geniş Kapasite:** 8-35kW arası model seçenekleri

### Bodrum ve Milas İçin Avantajlar

Bodrum ve Milas'ta villa sahipleri için Varm Up Serisi:

- Yazın soğutma, kışın ısıtma tek sistemde
- Yüksek verimlilik ile düşük enerji faturası
- Sessiz çalışma ile konforlu yaşam
- Uzaktan kontrol ile pratik yönetim

### Kurulum ve Bakım

Gül-Tekin Mühendislik ekibi profesyonel kurulum sağlar. Periyodik bakımları ile sisteminizin ömrünü uzatır. 2 yıl garanti kapsamında teknik destek sunar.

### Sonuç

Varmeks Varm Up Serisi, yerli mühendislik ile üretilen, yüksek verimli ve çevre dostu ısı pompası çözümüdür. Bodrum ve Milas bölgesinde ısıtma ve soğutma ihtiyaçlarınız için ideal seçimdir.`,
    imagePrompt: "A modern Varmeks Varm Up heat pump outdoor unit mounted on a white wall of a contemporary villa in Bodrum Turkey, Mediterranean landscape visible in background, blue sky, professional product photography, clean white and gray colors, winter setting with frost visible, high-end residential setting, 4k quality"
  },
  {
    topic: "Varmeks Varm Boost R290 Isı Pompası: Çevre Dostu Soğutucu Akışkan Teknolojisi",
    title: "Varmeks Varm Boost R290: Çevre Dostu Isı Pompası Teknolojisi",
    slug: "varmeks-varm-boost-r290-cevre-dostu",
    metaTitle: "Varmeks Varm Boost R290: Çevre Dostu Isı Pompası Teknolojisi",
    metaDescription: "Varmeks Varm Boost R290 ile çevre dostu ısı pompası teknolojisi! Düşük GWP değeri, yüksek verimlilik. Gül-Tekin Mühendislik güvencesiyle.",
    keywords: ["Varmeks", "Varm Boost", "R290", "çevre dostu", "ısı pompası", "GWP", "Bodrum", "Gül-Tekin", "yenilenebilir enerji"],
    content: `## Varmeks Varm Boost R290: Çevre Dostu Soğutucu Akışkan Teknolojisi

**SEO Başlığı:** Varmeks Varm Boost R290: Çevre Dostu Isı Pompası Teknolojisi

### Giriş

Varmeks Varm Boost Serisi, çevre dostu R290 soğutucu akışkan kullanarak sürdürülebilir enerji çözümleri sunar. Düşük GWP (Global Warming Potential) değeri ile karbon ayak izini minimize eder.

### R290 Teknolojisi Nedir?

R290 (propana), doğal bir soğutucu akışkandır. GWP değeri 3 olarak çok düşüktür. Bu özelliği ile çevre dostu bir alternatif sunar.

### Varm Boost Serisi Özellikleri

- **Kapasite:** 8-22 kW arası
- **Soğutucu Gaz:** R290
- **GWP Değeri:** 3 (çok düşük)
- **COP:** 4.2 - 4.6 arası
- **Wi-Fi Kontrol:** Evet
- **Garanti:** 2 yıl

### Çevre Dostu Özellikler

1. **Düşük GWP:** 3 değeri ile çevreye zararsız
2. **Yüksek Verimlilik:** Enerji tasarrufu sağlar
3. **Doğal Akışkan:** Propana bazlı çözüm
4. **Geri Dönüştürülebilir:** Çevre dostu malzeme

### Varm Boost Avantajları

- Çevre dostu çalışma
- Düşük enerji tüketimi
- Sessiz operasyon
- Uzaktan kontrol imkanı
- Uzun ömürlü tasarım

### Sonuç

Varmeks Varm Boost R290, çevre bilinci yüksek müşteriler için ideal seçimdir. Gül-Tekin Mühendislik ile hemen iletişime geçin.`,
    imagePrompt: "Close-up of Varmeks Varm Boost heat pump unit with visible R290 eco-friendly refrigerant labeling, green technology concept, sustainable energy theme, blue and green color gradient background, modern engineering design, professional product shot"
  },
  {
    topic: "Varmeks Varm All Sıcak Suyu Isı Pompası: 200-300L Tank Kapasitesi",
    title: "Varmeks Varm All: 75°C'ye Kadar Sıcak Su Isı Pompası",
    slug: "varmeks-varm-all-sicak-su-200-300l",
    metaTitle: "Varmeks Varm All: 75°C'ye Kadar Sıcak Su Isı Pompası",
    metaDescription: "Varmeks Varm All ile 200-300L tank kapasitesi! 75°C'ye kadar sıcak su, R290 gaz, düşük ses. Bodrum ve Milas'ta sıcak su çözümleri.",
    keywords: ["Varmeks", "Varm All", "sıcak su", "ısı pompası", "200L", "300L", "75°C", "R290", "Bodrum", "Gül-Tekin"],
    content: `## Varmeks Varm All: 75°C'ye Kadar Sıcak Su Çözümü

**SEO Başlığı:** Varmeks Varm All: 75°C'ye Kadar Sıcak Su Isı Pompası

### Giriş

Varmeks Varm All Serisi, kullanım sıcak suyu ihtiyaçlarınıza verimli çözümler sunar. 200L ve 300L tank kapasiteleri ile her ihtiyaca uygun seçenekler sunar.

### Varm All Serisi Özellikleri

- **Tank Kapasitesi:** 200L ve 300L
- **Maksimum Sıcaklık:** 75°C
- **Soğutucu Gaz:** R290
- **Ses Seviyesi:** Düşük
- **Wi-Fi:** Destekli

### Avantajları

1. **Yüksek Sıcaklık:** 75°C'ye kadar sıcak su
2. **Çevre Dostu:** R290 gaz
3. **Sessiz Çalışma:** Konforlu kullanım
4. **Akıllı Kontrol:** Wi-Fi ile yönetim

### Sonuç

Varmeks Varm All, sıcak su ihtiyaçlarınız için verimli ve çevre dostu çözüm sunar.`,
    imagePrompt: "Varmeks Varm All hot water heat pump with 200L stainless steel tank in a modern utility room, clean installation, LED display showing 75°C, warm water technology, energy efficient home solution, professional plumbing setup"
  },
  {
    topic: "Varmeks Varm Silent Pool: Sessiz Çalışan Havuz Isı Pompası (10-33kW)",
    title: "Varmeks Varm Silent Pool: Sessiz Havuz Isı Pompası",
    slug: "varmeks-varm-silent-pool-sessiz-havuz",
    metaTitle: "Varmeks Varm Silent Pool: Sessiz Havuz Isı Pompası (10-33kW)",
    metaDescription: "Varmeks Varm Silent Pool ile sessiz havuz ısı pompası! 10-33kW kapasite, R32 gaz, sessiz çalışma. Bodrum ve Milas'ta havuz ısıtma çözümleri.",
    keywords: ["Varmeks", "Silent Pool", "havuz ısı pompası", "sessiz", "10-33kW", "R32", "Bodrum", "havuz", "Gül-Tekin"],
    content: `## Varmeks Varm Silent Pool: Sessiz Havuz Isı Pompası

**SEO Başlığı:** Varmeks Varm Silent Pool: Sessiz Havuz Isı Pompası (10-33kW)

### Giriş

Varmeks Varm Silent Pool Serisi, havuz ısıtma ihtiyaçlarınıza sessiz ve verimli çözümler sunar. 10-33kW kapasite aralığı ile her büyüklükteki havuz için uygundur.

### Özellikler

- **Kapasite:** 10-33 kW
- **Soğutucu Gaz:** R32
- **Ses:** Sessiz çalışma
- **Wi-Fi:** Destekli

### Avantajları

1. **Sessiz Operasyon:** 53 dB(A) altında ses
2. **Enerji Verimliliği:** Yüksek COP değeri
3. **Akıllı Kontrol:** Wi-Fi ile yönetim
4. **Uzun Ömür:** Dayanıklı tasarım

### Sonuç

Varmeks Silent Pool, havuzlarınız için sessiz ve verimli ısıtma çözümü sunar.`,
    imagePrompt: "Varmeks Varm Silent Pool heat pump installed next to a crystal clear swimming pool in a luxury Bodrum resort, peaceful garden setting, silent operation concept, blue water reflections, tropical plants, 5-star hotel quality installation"
  },
  {
    topic: "Varmeks Commercial Duo: Ticari Yapılar için 50-92kW Isı Pompası Çözümleri",
    title: "Varmeks Commercial Duo: 50-92kW Ticari Isı Pompası",
    slug: "varmeks-commercial-duo-ticari-50-92kw",
    metaTitle: "Varmeks Commercial Duo: 50-92kW Ticari Isı Pompası",
    metaDescription: "Varmeks Commercial Duo ile ticari yapılar için 50-92kW ısı pompası! R290 gaz, DC Inverter, yüksek kapasite. Gül-Tekin Mühendislik güvencesi.",
    keywords: ["Varmeks", "Commercial Duo", "ticari", "50-92kW", "R290", "DC Inverter", "Gül-Tekin", "ticari yapı", "ısıtma"],
    content: `## Varmeks Commercial Duo: Ticari Yapılar için Yüksek Kapasite

**SEO Başlığı:** Varmeks Commercial Duo: 50-92kW Ticari Isı Pompası

### Giriş

Varmeks Commercial Duo Serisi, ticari yapılar için yüksek kapasiteli ısı pompası çözümleri sunar. 50-92kW kapasite aralığı ile otel, ofis ve endüstriyel tesisler için idealdir.

### Özellikler

- **Kapasite:** 50-92 kW
- **Soğutucu Gaz:** R290
- **Teknoloji:** DC Inverter
- **Wi-Fi:** Destekli
- **Garanti:** 2 yıl

### Ticari Avantajlar

1. **Yüksek Kapasite:** Büyük alanlar için uygun
2. **Enerji Tasarrufu:** Düşük işletme maliyeti
3. **Çevre Dostu:** R290 gaz
4. **Akıllı Yönetim:** Merkezi kontrol imkanı

### Sonuç

Varmeks Commercial Duo, ticari yapılarınız için güvenilir ve verimli ısıtma çözümü sunar.`,
    imagePrompt: "Multiple Varmeks Commercial Duo heat pumps installed on the roof of a modern commercial building in Turkey, industrial scale heating solution, blue sky backdrop, professional HVAC installation, energy efficient business solution"
  },
  {
    topic: "Varmeks Commercial Pool: Ticari Havuzlar için 26-145kW Yüksek Kapasite Isı Pompası",
    title: "Varmeks Commercial Pool: 26-145kW Ticari Havuz Isı Pompası",
    slug: "varmeks-commercial-pool-ticari-havuz-26-145kw",
    metaTitle: "Varmeks Commercial Pool: 26-145kW Ticari Havuz Isı Pompası",
    metaDescription: "Varmeks Commercial Pool ile ticari havuzlar için 26-145kW ısı pompası! R134a gaz, yüksek kapasite. Bodrum ve Milas'ta ticari havuz çözümleri.",
    keywords: ["Varmeks", "Commercial Pool", "ticari havuz", "26-145kW", "R134a", "Gül-Tekin", "havuz ısıtma", "yüksek kapasite"],
    content: `## Varmeks Commercial Pool: Ticari Havuzlar için Yüksek Kapasite

**SEO Başlığı:** Varmeks Commercial Pool: 26-145kW Ticari Havuz Isı Pompası

### Giriş

Varmeks Commercial Pool Serisi, ticari havuzlar için yüksek kapasiteli ısı pompası çözümleri sunar. 26-145kW kapasite aralığı ile her büyüklükteki havuz için uygundur.

### Özellikler

- **Kapasite:** 26-145 kW
- **Soğutucu Gaz:** R134a
- **Maksimum Sıcaklık:** 43°C
- **Yüksek Kapasite:** Evsel ve ticari havuzlar

### Avantajları

1. **Geniş Kapasite Aralığı:** 26-145kW
2. **Ticari Dayanıklılık:** Sürekli çalışma
3. **Verimli Isıtma:** Düşük enerji tüketimi
4. **Profesyonel Kurulum:** Gül-Tekin Mühendislik güvencesi

### Sonuç

Varmeks Commercial Pool, ticari havuzlarınız için güçlü ve güvenilir ısıtma çözümü sunar.`,
    imagePrompt: "Large Varmeks Commercial Pool heat pump system at an Olympic-sized indoor swimming pool facility, professional aquatic center, modern architecture, clean blue water, commercial grade HVAC equipment"
  },
  {
    topic: "Varmeks Isı Pompası Fiyatları 2025: Detaylı Maliyet Analizi ve Tasarruf Rehberi",
    title: "Varmeks Isı Pompası Fiyatları 2025: Maliyet ve Tasarruf Rehberi",
    slug: "varmeks-isi-pompasi-fiyatlari-2025",
    metaTitle: "Varmeks Isı Pompası Fiyatları 2025: Maliyet ve Tasarruf Rehberi",
    metaDescription: "Varmeks ısı pompası fiyatları 2025! Maliyet analizi, enerji tasarrufu, geri ödeme süresi. Bodrum ve Milas'ta Varmeks ısı pompası fiyatları.",
    keywords: ["Varmeks", "ısı pompası fiyatları", "2025", "maliyet", "tasarruf", "geri ödeme", "Bodrum", "Gül-Tekin", "fiyat"],
    content: `## Varmeks Isı Pompası Fiyatları 2025: Detaylı Maliyet Analizi

**SEO Başlığı:** Varmeks Isı Pompası Fiyatları 2025: Maliyet ve Tasarruf Rehberi

### Giriş

Varmeks ısı pompaları, yatırım maliyeti ve uzun vadeli tasarruf dengesiyle enerji verimliliği sağlar. Bu rehberde fiyatları ve maliyet analizini inceleyeceğiz.

### Fiyat Etkenleri

Varmeks ısı pompası fiyatları şu faktörlere göre değişir:

1. **Kapasite (kW):** 8kW'dan 145kW'a kadar
2. **Serisi:** Varm Up, Varm Boost, Varm All, Silent Pool, Commercial
3. **Kurulum Karmaşıklığı:** Boru mesafesi, tank ihtiyacı
4. **Opsiyonlar:** Wi-Fi, ek kontroller

### Enerji Tasarrufu

Varmeks ısı pompaları ile sağlanan tasarruf:

- **Isıtma:** Geleneksel sistemlere göre %60-70 tasarruf
- **Soğutma:** Merkezi sistemlere göre %50 tasarruf
- **Sıcak Su:** Termosifona göre %75 tasarruf

### Geri Ödeme Süresi

Yatırımınızı genellikle 3-5 yıl içinde geri alırsınız. Bu süre:
- Kullanım sıklığına
- Enerji fiyatlarına
- İklim koşullarına göre değişir

### Sonuç

Varmeks ısı pompaları, uzun vadede ekonomik ve çevre dostu çözüm sunar. Gül-Tekin Mühendislik ile detaylı fiyat teklifi alabilirsiniz.`,
    imagePrompt: "Infographic style image showing heat pump cost comparison chart with Turkish Lira symbols, energy savings graph, Varmeks product lineup with price indicators, modern office setting with laptop showing calculations, professional financial analysis theme"
  },
  {
    topic: "Varmeks vs LG vs Bosch Isı Pompaları: 2025 Karşılaştırma Rehberi",
    title: "Varmeks vs LG vs Bosch: 2025 Isı Pompası Karşılaştırma",
    slug: "varmeks-vs-lg-bosch-karsilastirma-2025",
    metaTitle: "Varmeks vs LG vs Bosch: 2025 Isı Pompası Karşılaştırma",
    metaDescription: "Varmeks, LG ve Bosch ısı pompaları 2025 karşılaştırması! Yerli üretim, fiyat, performans, garanti. Gül-Tekin Mühendislik uygular.",
    keywords: ["Varmeks", "LG", "Bosch", "karşılaştırma", "ısı pompası", "2025", "yerli", "Gül-Tekin", "fiyat", "performans"],
    content: `## Varmeks vs LG vs Bosch: 2025 Isı Pompası Karşılaştırma

**SEO Başlığı:** Varmeks vs LG vs Bosch: 2025 Isı Pompası Karşılaştırma

### Giriş

Isı pompası seçiminde marka karşılaştırması önemlidir. Bu rehberde Varmeks, LG ve Bosch markalarını karşılaştırıyoruz.

### Karşılaştırma Tablözü

| Özellik | Varmeks | LG | Bosch |
|---------|---------|-----|-------|
| **Üretim** | Yerli (Türkiye) | Yabancı | Yabancı |
| **Fiyat** | Uygun | Orta | Yüksek |
| **Garanti** | 2 yıl | 2 yıl | 2 yıl |
| **Yedek Parça** | Kolay erişim | Orta | Orta |
| **Servis** | Gül-Tekin ağı | Yetkili servis | Yetkili servis |

### Varmeks Avantajları

1. **Yerli Üretim:** Türkiye'de üretilir, yedek parça kolay
2. **Uygun Fiyat:** Rekabetçi fiyatlandırma
3. **Güçlü Servis:** Gül-Tekin Mühendislik ağı
4. **Yerli Mühendislik:** İhtiyaçlarınıza uygun çözümler

### Sonuç

Varmeks, yerli üretim ve uygun fiyat avantajıyla öne çıkar. Gül-Tekin Mühendislik ile detaylı bilgi alabilirsiniz.`,
    imagePrompt: "Three premium heat pump units side by side comparison - Varmeks, LG Therma V, and Bosch - in a modern showroom setting, Turkish flag subtle accent, technical specification overlay, professional comparison review style, blue and silver color scheme"
  },
  {
    topic: "Varmeks Isı Pompası Garantisi ve Teknik Destek: Kapsamlı Servis Rehberi",
    title: "Varmeks Isı Pompası Garantisi ve Teknik Destek Rehberi",
    slug: "varmeks-garanti-teknik-destek-rehberi",
    metaTitle: "Varmeks Isı Pompası Garantisi ve Teknik Destek Rehberi",
    metaDescription: "Varmeks ısı pompası garanti koşulları ve teknik destek hizmetleri! 2 yıl garanti, periyodik bakım, arıza müdahalesi. Gül-Tekin Mühendislik.",
    keywords: ["Varmeks", "garanti", "teknik destek", "servis", "bakım", "arıza", "Gül-Tekin", "ısı pompası", "yedek parça"],
    content: `## Varmeks Isı Pompası Garantisi ve Teknik Destek

**SEO Başlığı:** Varmeks Isı Pompası Garantisi ve Teknik Destek Rehberi

### Giriş

Varmeks ısı pompaları 2 yıl garanti kapsamında üretilir. Gül-Tekin Mühendislik olarak kapsamlı teknik destek ve servis hizmetleri sunuyoruz.

### Garanti Koşulları

Varmeks ısı pompaları için garanti kapsamı:

- **Süre:** 2 yıl
- **Kapsam:** Üretim hataları
- **Kompresör:** Özel garanti koşulları
- **Yedek Parça:** Orijinal parça garantisi

### Teknik Destek Hizmetleri

Gül-Tekin Mühendislik olarak sunduğumuz hizmetler:

1. **Periyodik Bakım:** Yıllık bakım hizmeti
2. **Arıza Müdahalesi:** 7/24 teknik destek
3. **Yedek Parça:** Orijinal parça temini
4. **Danışmanlık:** Doğru model seçimi

### Bakım İpuçları

- Filtreleri düzenli temizleyin
- Dış üniteyi kontrol edin
- Soğutucu seviyesini takip edin
- Profesyonel yıllık bakım yaptırın

### Sonuç

Varmeks ısı pompaları, güvenilir garanti ve kapsamlı teknik destek ile yanınızdadır.`,
    imagePrompt: "Professional Varmeks service technician in uniform working on a heat pump unit, toolbox and diagnostic equipment visible, warranty document in background, customer service excellence theme, Gül-Tekin Mühendislik branded van in background, Bodrum villa setting"
  },
  {
    topic: "Varmeks Isı Pompaları Neden Tercih Edilir? 2025 Alın Teri Rehberi",
    title: "Neden Varmeks Isı Pompası Tercih Edilmeli? 2025 Rehberi",
    slug: "neden-varmeks-isi-pompasi-tercih",
    metaTitle: "Neden Varmeks Isı Pompası Tercih Edilmeli? 2025 Rehberi",
    metaDescription: "Varmeks ısı pompası neden tercih edilir? Yerli üretim, uygun fiyat, güçlü servis, çevre dostu. Bodrum ve Milas'ta Varmeks güvencesi.",
    keywords: ["Varmeks", "neden tercih", "yerli üretim", "fiyat", "servis", "çevre dostu", "Bodrum", "Gül-Tekin", "ısı pompası"],
    content: `## Neden Varmeks Isı Pompası Tercih Edilmeli?

**SEO Başlığı:** Neden Varmeks Isı Pompası Tercih Edilmeli? 2025 Rehberi

### Giriş

Varmeks, Türkiye'nin yerli ısı pompası üreticisi olarak birçok avantaj sunar. İşte Varmeks'i tercih etmeniz için nedenler:

### 1. Yerli Üretim Avantajı

- Türkiye'de üretilir
- Yedek parça temini kolay
- Yerli mühendislik bilgisi
- Hızlı servis imkanı

### 2. Uygun Fiyat

- Rekabetçi fiyatlandırma
- Uzun vadeli tasarruf
- Yatırım geri ödeme süresi kısa

### 3. Güçlü Servis Ağı

- Gül-Tekin Mühendislik güvencesi
- 7/24 teknik destek
- Yerel servis imkanı
- Periyodik bakım hizmeti

### 4. Çevre Dostu Teknoloji

- R290 ve R32 gaz seçenekleri
- Düşük karbon emisyonu
- Yenilenebilir enerji kullanımı

### 5. Geniş Ürün Yelpazesi

- Varm Up: 8-35kW
- Varm Boost: 8-22kW
- Varm All: Sıcak su
- Silent Pool: Havuz
- Commercial: Ticari

### Sonuç

Varmeks, yerli üretim, uygun fiyat ve güçlü servis avantajıyla ısı pompası seçiminde öne çıkar. Gül-Tekin Mühendislik ile hemen iletişime geçin.`,
    imagePrompt: "Happy Turkish family in a warm living room during winter, Varmeks heat pump indoor unit visible on wall, comfort and warmth theme, energy bill savings concept, modern Turkish home interior, Bodrum/Milas coastal landscape visible through window"
  }
];

async function main() {
  console.log('=== VARMeks BLOG ICERIK OLUSTURMA ===\n');

  const results = [];

  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i];
    console.log(`[${i + 1}/10] Kaydediliyor: ${post.title.substring(0, 50)}...`);

    try {
      const saved = await sql`
        INSERT INTO generated_content (
          topic,
          title,
          content,
          slug,
          meta_title,
          meta_description,
          keywords,
          image_prompt,
          status,
          published_at
        ) VALUES (
          ${post.topic},
          ${post.title},
          ${post.content},
          ${post.slug},
          ${post.metaTitle},
          ${post.metaDescription},
          ${post.keywords},
          ${post.imagePrompt},
          'published',
          NOW()
        )
        RETURNING id, slug
      `;

      results.push({
        id: saved[0].id,
        title: post.title,
        slug: saved[0].slug,
        imagePrompt: post.imagePrompt,
        status: 'success'
      });

      console.log(`   ✅ Kaydedildi (ID: ${saved[0].id})`);
    } catch (error) {
      console.log(`   ❌ Hata: ${error.message}`);
      results.push({
        title: post.title,
        status: 'failed',
        error: error.message
      });
    }
  }

  // Özet
  console.log('\n\n=== OZET ===');
  const success = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  console.log(`✅ Başarılı: ${success.length}`);
  console.log(`❌ Başarısız: ${failed.length}`);

  // Image prompt listesi
  console.log('\n\n=== GEMINI RESIM PROMPT\'LARI ===\n');
  results.forEach((r, i) => {
    if (r.status === 'success') {
      console.log(`--- Blog ${i + 1}: ${r.title.substring(0, 40)}... ---`);
      console.log(`ID: ${r.id}`);
      console.log(`Slug: ${r.slug}`);
      console.log(`\nImage Prompt (Gemini):`);
      console.log(r.imagePrompt);
      console.log('\n');
    }
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
