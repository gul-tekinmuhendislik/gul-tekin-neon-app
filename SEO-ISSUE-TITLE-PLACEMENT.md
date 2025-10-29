# SEO Issue: Title Element Placement Problem

## Problem
`<title>` ve `<meta>` elementleri `<head>` elementi dışında, `</body>` kapanış taginden sonra render ediliyor.

## Etkilenen Sayfalar
- Tüm lokasyon sayfaları (/lokasyonlar/*)
- Tüm marka sayfaları (/markalar/*)
- İletişim sayfası (/contact)
- Diğer tüm sayfalar

## Kök Neden
Next.js 15.5.3 + React 19 kombinasyonunda metadata API'nin React 19'un yeni streaming özellikleriyle uyumsuzluğu.

## Çözüm

### Önerilen: React 18'e Downgrade
```bash
npm install react@^18 react-dom@^18 @types/react@^18 @types/react-dom@^18
npm run build
```

### Alternatif: Next.js Güncellemesini Bekle
Next.js 15.6+ veya gelecek bir patch bu sorunu çözecek.

## Doğrulama
```bash
curl -s http://localhost:3000/contact | grep -A5 -B5 "<title"
```

`<title>` elementi `<head>` içinde ve `</head>` kapanışından önce olmalı.

## Referanslar
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- React 19 Streaming: https://react.dev/blog/2024/04/25/react-19

## Tarih
2025-10-29 - Sorun tespit edildi ve çözüm önerileri dokümante edildi.
