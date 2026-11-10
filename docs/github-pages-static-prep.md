# GitHub Pages için Statik Hazırlık Notları

Bu repo şu an dinamik Next.js uygulaması olduğu için GitHub Pages’e doğrudan taşınmaz.
Aşağıdaki hazırlık, statik siteye geçiş için gereken adımları ve GitHub CLI komutlarını özetler.

## Durum

- Mevcut proje: Next.js + Prisma + API routes + OAuth + database-backed app
- GitHub Pages: statik dosya sunumu yapar
- Bu yüzden mevcut yapı, `output: 'export'` veya Pages deployment ile doğrudan uyumlu değildir

## Hazırlık adımları

### 1) Statik hale getirme hedefi

Aşağıdaki alanları kaldırın veya ayrı servislerde tutun:

- `app/api/**`
- Prisma + Neon veritabanı erişimi
- OAuth akışları
- Google Search Console sync
- admin panel
- dinamik content generation
- form submit backend

### 2) Statik içerik kaynakları

- ürün listeleri: JSON / Markdown
- blog içerikleri: Markdown dosyaları
- görseller: Cloudinary / public klasörü
- sayfa verileri: statik dosyalar

### 3) GitHub Pages için gerekli modül ayarları

`next.config.ts`:

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 4) GitHub Actions workflow

`.github/workflows/pages.yml` örneği:

```yaml
name: Deploy static site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: corepack enable && pnpm install --frozen-lockfile

      - name: Build static export
        run: pnpm build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## GitHub CLI komutları

Repo için Pages ayarı:

```bash
gh repo view
gh repo edit --enable-pages
```

Pages branch / action kurulumuna hazır olmak için:

```bash
gh workflow list
```

## Not

Bu repo şu anda statik export için hazır değildir. Dinamik Next.js API ve server-side işleyişi olduğu için GitHub Pages’e geçiş için önce statik siteye dönüştürme gereklidir.

Önerilen rota:

1. Vercel’de kalmak
2. gerekiyorsa Vercel plan yükseltmek
3. sadece statik bir marketing site için ayrı GitHub Pages sürümünü oluşturmak
