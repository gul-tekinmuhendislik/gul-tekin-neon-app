# Prisma Migration Guide

## ✅ Prisma Başarıyla Kuruldu!

Prisma artık projeye entegre edildi ve **mevcut kod çalışmaya devam ediyor**. İki yaklaşım yan yana kullanılabilir:

### 1. Neon Serverless (Mevcut - Değişmedi)
```typescript
import { sql } from '@/lib/db';

const products = await sql`
  SELECT * FROM urunler WHERE marka = 'Varmeks'
`;
```

### 2. Prisma (Yeni - Type-Safe)
```typescript
import prisma from '@/lib/prisma';

const products = await prisma.urunler.findMany({
  where: { marka: 'Varmeks' }
});
```

## 📦 Kurulu Paketler

- `@prisma/client@6.18.0` - Prisma Client
- `prisma@6.18.0` - Prisma CLI (dev dependency)

## 🗃️ Veritabanı Schema

- **Lokasyon**: `prisma/schema.prisma`
- **Tablolar**: 31 tablo otomatik olarak çekildi
- **Kolonlar**: Tüm kolonlar (indexes dahil) doğru şekilde map edildi
- **İlişkiler**: Foreign key'ler otomatik olarak tanımlandı

## 🎯 Kullanılan Özellikler

### Connection Pooling (Neon)
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")          // Pooled connection
  directUrl = env("DATABASE_URL_UNPOOLED") // Direct connection for migrations
}
```

### Next.js Optimizasyonu
```typescript
// lib/prisma.ts - Singleton pattern
const prisma = globalForPrisma.prisma || new PrismaClient();
```

## 📝 Yeni Scriptler

```bash
# Prisma Client oluştur
npm run prisma:generate

# Veritabanından schema güncelle
npm run prisma:pull

# Prisma Studio aç (GUI database management)
npm run prisma:studio
```

## 🔄 Build Process

Build sırasında Prisma Client otomatik oluşturulur:
```json
"build": "prisma generate && next build"
```

## ✨ Prisma Avantajları

### 1. Type Safety
```typescript
// ❌ Eski yöntem - runtime error riski
const product = await sql`SELECT * FROM urunler WHERE id = ${id}`;
console.log(product.urun_adi); // TypeScript bilmiyor bu field var mı

// ✅ Prisma - compile-time type checking
const product = await prisma.urunler.findUnique({ where: { id } });
console.log(product?.urun_adi); // TypeScript tam olarak biliyor!
```

### 2. Auto-completion
VS Code/Cursor'da tüm tablo ve kolon isimleri otomatik tamamlanır.

### 3. Relation Queries
```typescript
// Foreign key'leri otomatik takip eder
const mahalle = await prisma.mahalleler.findUnique({
  where: { id: 1 },
  include: {
    hizmet_lokasyonlari: true // İlişkili tablo otomatik gelir
  }
});
```

### 4. Migration Management
```bash
# Gelecekte migration oluşturmak için
npx prisma migrate dev --name add_new_column
```

## 🎨 Prisma Studio

Veritabanını GUI ile yönetmek için:
```bash
npm run prisma:studio
```
Tarayıcıda açılır: http://localhost:5555

## 🚀 Örnek Kullanım

### Mevcut: Neon Serverless
```typescript
// components/VarmeksProducts.tsx
const products = await sql`
  SELECT id, urun_adi, slug, kategori, marka, aciklama, cloudinary_url
  FROM urunler
  WHERE marka = 'Varmeks'
    AND anasayfa_goster = true
    AND (stokta = true OR stokta IS NULL)
  ORDER BY updated_at DESC
  LIMIT 6
`;
```

### Yeni: Prisma (components/VarmeksProducts.prisma.tsx)
```typescript
const products = await prisma.urunler.findMany({
  where: {
    marka: 'Varmeks',
    anasayfa_goster: true,
    OR: [
      { stokta: true },
      { stokta: null }
    ]
  },
  orderBy: { updated_at: 'desc' },
  take: 6,
  select: {
    id: true,
    urun_adi: true,
    slug: true,
    kategori: true,
    marka: true,
    aciklama: true,
    cloudinary_url: true
  }
});
```

**Her iki yöntem de çalışır!** Yavaş yavaş geçiş yapabilirsiniz.

## 📋 Migration Stratejisi

### Kademeli Geçiş Önerisi

1. ✅ **Adım 1**: Prisma kuruldu (tamamlandı)
2. ✅ **Adım 2**: Schema çekildi (tamamlandı)
3. ✅ **Adım 3**: Test edildi (tamamlandı)
4. 🔄 **Adım 4**: Yeni özellikler Prisma ile yazılır
5. 🔄 **Adım 5**: Eski kod ihtiyaç halinde refactor edilir

**Önemli**: Acele etmeyin! Mevcut kod gayet iyi çalışıyor.

## 🔧 Troubleshooting

### Prisma Client bulunamıyor?
```bash
npm run prisma:generate
```

### Schema güncellenmedi?
```bash
npm run prisma:pull
npm run prisma:generate
```

### Development'ta hot-reload sorunu?
Prisma Client cache'leniyor, server'ı restart edin:
```bash
# Development server'ı yeniden başlat
npm run dev
```

## 📚 Daha Fazla Bilgi

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma + Next.js](https://www.prisma.io/nextjs)
- [Prisma + Neon](https://www.prisma.io/docs/guides/database/using-prisma-with-neon)

## 🎉 Sonuç

Prisma başarıyla kuruldu ve **sistem bozulmadı**! İstediğiniz zaman Prisma kullanabilir, istediğiniz zaman raw SQL kullanabilirsiniz.
