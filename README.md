# Gül Tekin Mühendislik

Bu depo, `Next.js 15` ve `React 19` tabanlı bir web uygulamasını içerir. Proje, `Prisma`, `Inngest`, `Cloudinary`, Google AI ve SEO optimizasyonlarını kullanır.

## Kurulum

1. `pnpm install`
2. `.env` dosyanızı proje kökünde yapılandırın
3. `pnpm prisma generate`

## Geliştirme

- `pnpm dev`

## Üretim Build

- `pnpm build`

## Önemli Komutlar

- `pnpm lint`
- `pnpm test`
- `pnpm prisma:generate`
- `pnpm prisma:studio`

## Notlar

- `package.json` içinde `postinstall` adımı olarak `prisma generate` çalıştırılır.
- Sunucu tarafı yapılandırmalar için `next.config.ts`, `prisma.config.ts` ve `.env` dosyasını kontrol edin.
