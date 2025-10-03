import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function checkEmptyKategori() {
  try {
    const result = await sql`
      SELECT id, urun_adi, kategori, marka
      FROM urunler
      WHERE kategori IS NULL OR kategori = ''
      ORDER BY urun_adi
    `;

    console.log(`\n📊 Kategori alanı boş olan kayıtlar: ${result.length}\n`);

    result.forEach((row: any, index: number) => {
      console.log(`${index + 1}. ${row.urun_adi}`);
      console.log(`   Marka: ${row.marka || '(boş)'}`);
      console.log(`   Kategori: ${row.kategori || '(boş)'}`);
      console.log(`   ID: ${row.id}\n`);
    });
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkEmptyKategori();
