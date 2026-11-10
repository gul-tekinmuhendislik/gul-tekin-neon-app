# GitHub Pages’e Minimum Statik Site Geçiş Planı (Görsel Görünüm Korunur)

## Hedef ve kapsam
- **Hedef:** Mevcut sitenin **tüm herkese açık sayfalarının görsel görünümünü (layout, stil, bileşenler, görseller, tipografi, animasyonlar) koruyarak** GitHub Pages üzerinde tamamen statik olarak yayınlanması.
- **Kapsam (A):** Ana sayfa, ürün/hizmet/lokasyon/proje/blog/fabrika gezisi/markalar/özel landing sayfaları (`/about`, `/contact`, `/privacy`, `/terms`, `/gunes-enerjisi`, `/bodrum-*`, `/solimpeks-*`, `/yelkenci-*`, `/isi-pompasi-sorunlari-ve-cozumleri` vb.) ve bunların mevcut SEO metadata/sitemap/robots çıktıları **build-time statik** olarak korunur.
- **Kapsam dışı (çalışır halde taşınmaz):** `app/api/**`, `app/admin/**`, `app/ai`, `app/gmb`, `app/seo`, `app/twitter`, Prisma/Neon (`lib/db`, `prisma/**`, `prisma.config.ts`), OAuth, cron/sync, AI/chat, DB’ye yazan formlar, arama/filtre/pagination’ın sunucu tarafı dinamik davranışı. Bu alanlar statik sitede **route olarak kaldırılır veya statik “devre dışı” sayfaya yönlendirilir**; işlevleri GitHub Pages’te yoktur.

## Mevcut durum (plandan çıkarılan gerçekler)
- Stack: Next.js 15 (App Router) + React 19 + Tailwind + `next/image` + Cloudinary uzak görseller (`next.config.ts`), `middleware.ts`, dinamik sitemap/robots, çok sayıda API route, admin panelleri.
- Veri kaynağı: Neon/Postgres üzerinden `sql` (`lib/db`) ve Prisma; ana sayfa sayaçları, ürün/blog/hizmet/proje/lokasyon listeleri ve sitemap DB’den besleniyor. Birçok sayfada `export const dynamic = 'force-dynamic'` / `revalidate = 0`.
- Görseller: büyük ölçüde `public/` ve `res.cloudinary.com` (zaten optimize). `images.unoptimized: true` mevcut.
- Build: `prisma generate && next build` (mevcut). Statik export için farklı strateji gerekir.

## Mimari strateji (görsel kaybı önlemek için temel ilke)
**UI katmanını değiştirmeden**, veri erişimini “runtime DB”den “build-time statik veri”ye çevirmek:
1. **Statik veri snapshot’u:** Build öncesi tek seferlik bir script DB’den (mevcut `.env` ile, CI’da secret olarak sağlanır) herkese açık içerikleri çekip repo içine versiyonlanmış JSON/TS veri dosyalarına yazar (`data/static/*.json` veya `content/*.json`). Statik site bu dosyalardan beslenir; görsel bileşenler aynı props/markup ile render edilir.
2. **Build-time render:** Tüm public sayfalar SSG olacak (`force-dynamic`/`revalidate:0` kaldırılacak, dinamik segmentlerde `generateStaticParams` ile tüm slug’lar üretilecek). Listeleme sayfaları (ürün/blog/proje vb.) **tüm veriyi build-time render** eder; arama/filtre/pagination varsa client-side’a taşınır (UI aynı kalır, davranış client’ta çalışır).
3. **Next static export:** `output: 'export'`, `trailingSlash`/`basePath` GitHub Pages kurulumuna göre ayarlanır, `images` export-uyumlu (global unoptimized), `redirects/headers` (next.config) Pages’te desteklenmediği için alternatifleri uygulanır.
4. **Dağıtım:** GitHub Actions ile `next build` → `out/` → GitHub Pages deploy. Custom domain varsa `CNAME` ve repo ayarları korunur.

## Uygulama adımları (sıralı)

### 1) Envanter ve dondurma (kapsam netleştirme)
- `app/` altındaki **tüm public route’ları** ve bunların hangi tablo/veriye bağlı olduğunu çıkar (ana sayfa sayaçları, `/urunler` & `[slug]`, `/blog` & `[slug]`, `/hizmetler`, `/projeler`, `/lokasyonlar`, `/markalar`, landing’ler, `sitemap.ts`, `robots.ts`).
- Her route için: veri kaynağı, dinamik directive, slug param kaynağı, client etkileşimi (form, arama) listesini bir tablo olarak plana ekle (uygulama sırasında kontrol listesi).
- **Çıktı/kabul:** Hiçbir public sayfa envanter dışında kalmaz; “görsel kaybı yok” için referans olarak mevcut canlı/Vercel görünümü ve kritik sayfa listesi belirlenir.

### 2) Statik veri katmanı (DB → snapshot)
- `scripts/export-static-data.(ts|js)` ekle: `sql` ile `urunler`, `hizmetler`, `projeler_gul_tekin`, `hizmet_lokasyonlari`, blog kaynakları (`generated_content` + `blog_posts`, sitemap’teki birleşimle uyumlu), ana sayfa sayaçları ve sitemap’in ihtiyaç duyduğu alanları çeker; `data/static/*.json` (veya benzeri) olarak yazar. Eksik/nullable alanlar için güvenli fallback’ler mevcut UI’daki fallback’lerle aynı tutulur.
- `lib/static-data` (veya eşdeğeri) okuyucu modüller: bileşen/sayfalar DB yerine bu JSON’ları import/okur. `lib/db` ve Prisma bağımlılığı public build yolundan çıkarılır.
- **Görsel bütünlük:** İçerik metinleri, görsel URL’leri (Cloudinary/public path), sıralama ve sayfa başına gösterim mevcutla aynı olsun diye snapshot sorguları mevcut sorgularla eşleştirilir.
- **Çıktı/kabul:** DB olmadan (network/secret yokken) `data/static` ile public sayfalar render edilebilir.

### 3) Sayfa dönüşümleri (SSG, görsel aynı)
- **`app/page.tsx`:** `sql` sayaç sorgularını kaldır; sayaçları snapshot’tan al. `revalidate` kaldır; bileşen ağacı ve props aynı kalsın.
- **Liste/detay sayfaları** (`/urunler`, `/urunler/[slug]`, `/blog`, `/blog/[slug]`, `/hizmetler`, `/hizmetler/[slug]`, `/projeler`, `/projeler/[slug]`, `/lokasyonlar` ve alt route’lar): `force-dynamic`/`revalidate:0` kaldır, veriyi snapshot’tan oku, `[slug]` route’larda `generateStaticParams` tüm slug’ları döndürsün. Mevcut markup/CSS/className’ler korunur.
- **`/urunler` arama/filtre/pagination:** Şu an server-side query param + DB. Görünümü korumak için aynı UI bileşenleri korunur, veri seti build-time gömülür ve filtreleme/sayfalama **client-side** yapılır (URL query ile senkron istenirse client router); `generateMetadata` dinamik param yerine statik/base metadata + client-side title güncellemesi (veya sabit başlık) ile değiştirilir. Sayfa başına adet ve kart düzeni aynı kalır.
- **`/contact`:** Görsel düzen (başlık, metin, harita, WhatsApp/telefon/mail linkleri, Google Maps embed/link) birebir korunur. DB’ye yazan `ContactForm` submit’i GitHub Pages’te çalışmayacağından: (öneri) Formspree/Basin gibi statik-uyumlu endpoint’e POST veya `mailto:` fallback; form alanları ve stilleri aynı kalır. Harita `GoogleMap` bileşeni API-key gerektiriyorsa statik embed/iframe veya mevcut link tabanlı görünüme dönüştürülür (görsel olarak eşdeğer).
- **`app/components/Header|Footer|WhatsAppButton|CookieBanner` ve landing bileşenleri:** DB/`use server` bağımlılığı yoksa olduğu gibi kalır; varsa props’u snapshot/veri dosyasından alır.
- **Diğer public sayfalar:** İçeriği statik/hardcoded ise olduğu gibi SSG; DB okuyan varsa snapshot’a bağlanır.
- **Çıktı/kabul:** `output: 'export'` ile tüm public route’lar hatasız prerender olur; sayfa bazında görsel regresyon kontrol listesi (aşağıda) geçer.

### 4) Next config ve platform uyumu (GitHub Pages)
- `next.config.ts`: `output: 'export'` ekle; `images: { unoptimized: true, remotePatterns... }` export-uyumlu bırak (loader gerektirmez). `headers()` ve `redirects()` GitHub Pages’te çalışmaz — kritik SEO yönlendirmeleri için `public/_redirects` (uygulanabilirse) veya hedef route’larda statik içerik/alternatif; mümkün olmayanlar dokümante edilir.
- `basePath`/`assetPrefix`: **project pages** ise (`/<repo>/`) ayarlanır; **custom domain/user pages** ise boş bırakılır. `trailingSlash` Pages davranışına göre tutarlı seçilir ve iç linkler buna uyarlanır.
- `public/`: Gerekirse `.nojekyll` ekle; custom domain için `CNAME` dosyası korunur/eklenir.
- `middleware.ts`: Edge/middleware Pages’te yok — kaldırılır veya build’den dışlanır (favicon 204 davranışı statik hostingde gereksiz).
- Script/analytics (`layout.tsx`): GTM/Vercel Analytics/Speed Insights client script’leri statik sitede çalışmaya devam eder; Vercel’e özgü bileşenler istenirse korunur veya sadeleştirilir (görünümü etkilemez).
- **Çıktı/kabul:** `out/` dizini kendi başına servis edilebilir; asset yolları kırık değil.

### 5) Dinamik/özel alanların ayrıştırılması
- `app/api/**`, `app/admin/**`, `app/ai`, `app/gmb`, `app/seo`, `app/twitter` ve DB’yi zorunlu kılan yardımcı route’lar: statik export’tan çıkar (dizinleri taşı/rename veya ayrı “app-dynamic”a ayır) ya da GitHub Pages build’inde dahil edilmeyecek şekilde yapılandır. Amaç: public statik build’in bu kodlara bağımlı olmaması.
- `package.json` scripts: statik site için `build:static` (örn. `node scripts/export-static-data && next build`) ve mevcut dinamik build’i (`build:vercel`/mevcut `build`) koruyacak şekilde ayrıştır; `postinstall`’daki `prisma generate` statik pipeline’ı engellemeyecek şekilde koşullandırılır veya CI’da ayrıştırılır.
- **Çıktı/kabul:** `prisma`/`@neondatabase` public bundle için zorunlu değil; statik build deterministik.

### 6) SEO ve meta çıktıları (statik)
- `sitemap.ts` ve `robots.ts`: `force-dynamic` kaldırılıp snapshot’tan statik `MetadataRoute.Sitemap/Robots` üretir (`next build` ile export’ta `sitemap.xml`/`robots.txt` oluşur).
- Canonical/OG/Twitter meta ve JSON-LD (`layout.tsx`, sayfa metadata’ları) mevcut içerikle aynı kalır; dinamik sayılara bağlı metinler snapshot değerleriyle sabitlenir.
- **Çıktı/kabul:** URL seti ve metadata, mevcut public site ile eşdeğer.

### 7) CI/CD ve GitHub Pages yayın
- `.github/workflows/deploy-pages.yml`: `push` (main) + opsiyonel `workflow_dispatch`; Node/pnpm kurulumu, (gerekirse secret’lı) `export-static-data`, `next build`, `actions/upload-pages-artifact` (`out/`), `actions/deploy-pages`. Pages “GitHub Actions” kaynağına ayarlanır.
- Veri güncelleme stratejisi: içerik değiştiğinde (DB güncellemesi sonrası) workflow yeniden tetiklenir veya periyodik rebuild (cron) tanımlanır — statik site gerçek zamanlı güncellenmez (bilinen kısıt).
- **Çıktı/kabul:** Her başarılı çalıştırma `https://<user>.github.io/<repo>/` veya custom domain’de güncel statik siteyi yayınlar.

### 8) Doğrulama ve görsel regresyon kontrolü
- **Lokal:** statik veriyle `next build` (export) ve `out/` üzerinde statik sunucu ile smoke test; kırık link/asset taraması.
- **Görsel karşılaştırma (zorunlu, “görsel kaybı yok” kriteri):** Kritik sayfa listesi — ana sayfa, ürün liste + 1 detay, blog liste + 1 detay, hizmet/lokasyon/proje detayları, iletişim, hakkımızda, landing’ler — mevcut dağıtım ile statik çıktı arasında manuel yan yana kontrol (viewport’lar: mobil/desktop). Hero/slider, fontlar, Tailwind sınıfları, Cloudinary görselleri, ikonlar ve boş veri durumları kontrol edilir.
- **Fonksiyonel notlar:** Form submit (harici servis), arama/filtre (client-side), admin/api yok — bunlar görsel değil davranış farkı olarak kabul kriterlerine yazılır.
- **Çıktı/kabul:** Kritik sayfalarda layout/stil/görsel farkı yok; içerik snapshot ile birebir.

## Dosya/alan etkisi (beklenen)
- **Yeni:** `scripts/export-static-data.*`, `data/static/*.json` (veya `content/`), `.github/workflows/deploy-pages.yml`, gerekirse `public/.nojekyll`, `public/CNAME`.
- **Değişecek:** `next.config.ts`, `package.json` (script ayrımı), public `app/**/page.tsx` ve ilgili bileşenler (DB → snapshot, dynamic/export uyumu), `app/sitemap.ts`, `app/robots.ts`, `app/contact`/`ContactForm`, `middleware.ts` (kaldırma/etkisizleştirme).
- **Kapsam dışı bırakılacak/ayrılacak:** `app/api/**`, `app/admin/**`, `app/ai`, `app/gmb`, `app/seo`, `app/twitter`, `lib/db.ts` (public yoldan), `prisma/**`, `prisma.config.ts`.

## Riskler ve azaltımlar
- **Veri bayatlar:** Statik site yalnızca rebuild ile güncellenir → DB erişimli export + otomatik/manuel rebuild süreci tanımlanır.
- **Görsel fark riski:** Runtime veri farkı (sıralama/eksik alan) → snapshot sorguları mevcutla birebir; fallback’ler korunur; görsel regresyon kontrolü zorunlu kapı.
- **`next/image`/uzak görseller:** Export’ta optimizer yok → `unoptimized: true` (mevcut) ile aynı URL’ler kullanılır, Cloudinary tarafı optimizasyonu devam eder.
- **Redirects/headers kaybı:** Pages desteklemez → kritik yönlendirmeler için statik alternatifler/dokümantasyon.
- **İletişim formu:** DB yazımı yok → harici form servisi veya mailto; UI aynı.
- **Arama/filtre/pagination:** Server-side’dan client-side’a → aynı bileşen/düzen, veri client’ta filtrelenir.
- **Base path kırılması:** Yanlış `basePath` → deploy hedefi (custom domain vs project pages) baştan sabitlenir ve linkler ona göre doğrulanır.

## Bilinen sınırlar (GitHub Pages, statik)
- API, sunucu aksiyonu, middleware, auth, veritabanı, cron, AI, admin ve dosya yükleme çalışmaz.
- İçerik gerçek zamanlı değil; güncelleme = yeniden export + rebuild + deploy.
- İletişim formu ve benzeri etkileşimler ancak 3. parti statik servislerle çalışır.

## DoD (tamamlanma kriteri)
- [ ] Kapsam A’daki tüm public sayfalar `out/` içinde statik olarak üretiliyor ve GitHub Pages’te açılıyor.
- [ ] Kritik sayfalarda (liste yukarıda) mevcut siteye göre **görsel görünüm farkı yok** (layout/stil/görsel/bileşen).
- [ ] İçerik (ürün/blog/hizmet/proje/lokasyon/sayaçlar) snapshot üzerinden doğru ve tam.
- [ ] Sitemap/robots ve temel SEO meta korunuyor.
- [ ] Dinamik alanlar (API/admin/DB/auth/AI) public statik siteden ayrılmış; kısıtlar dokümante.
- [ ] CI/CD ile tekrarlanabilir deploy çalışıyor.
