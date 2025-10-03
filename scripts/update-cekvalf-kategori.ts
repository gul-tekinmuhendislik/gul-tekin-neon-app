import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function updateCekvafKategori() {
  try {
    const result = await sql`
      UPDATE urunler
      SET kategori = 'Çekvalfler',
          updated_at = NOW()
      WHERE (kategori IS NULL OR kategori = '')
        AND (urun_adi ILIKE '%çekvalf%' OR urun_adi ILIKE '%check valve%')
      RETURNING id, urun_adi, kategori, marka
    `;

    console.log(`\n✅ ${result.length} kayıt güncellendi:\n`);

    result.forEach((row: any, index: number) => {
      console.log(`${index + 1}. ${row.urun_adi}`);
      console.log(`   Marka: ${row.marka}`);
      console.log(`   Yeni Kategori: ${row.kategori}`);
      console.log(`   ID: ${row.id}\n`);
    });
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

updateCekvafKategori();
