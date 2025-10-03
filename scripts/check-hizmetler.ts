import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function checkHizmetler() {
  try {
    // Hizmetler tablosundaki tüm benzersiz hizmetleri listele
    const hizmetler = await sql`
      SELECT id, hizmet_adi, slug
      FROM hizmetler
      ORDER BY hizmet_adi
    `;

    console.log(`\n📊 Toplam Hizmet Sayısı: ${hizmetler.length}\n`);

    hizmetler.forEach((row: any, index: number) => {
      console.log(`${index + 1}. ${row.hizmet_adi}`);
      console.log(`   Slug: ${row.slug}`);
      console.log(`   ID: ${row.id}\n`);
    });

    // Ürünlerdeki benzersiz kategorileri listele
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const kategoriler = await sql`
      SELECT DISTINCT kategori, COUNT(*) as adet
      FROM urunler
      WHERE kategori IS NOT NULL AND kategori != ''
      GROUP BY kategori
      ORDER BY kategori
    `;

    console.log(`📦 Ürünlerdeki Benzersiz Kategoriler: ${kategoriler.length}\n`);

    kategoriler.forEach((row: any) => {
      console.log(`• ${row.kategori} (${row.adet} ürün)`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkHizmetler();
