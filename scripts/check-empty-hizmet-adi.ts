import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function checkEmptyHizmetAdi() {
  try {
    const result = await sql`
      SELECT id, urun_adi, kategori, marka, hizmet_adi, hizmet_id
      FROM urunler
      WHERE hizmet_adi IS NULL OR hizmet_adi = ''
      ORDER BY kategori, urun_adi
    `;

    console.log(`\n📊 Hizmet_adi alanı boş olan kayıtlar: ${result.length}\n`);

    result.forEach((row: any, index: number) => {
      console.log(`${index + 1}. ${row.urun_adi}`);
      console.log(`   Kategori: ${row.kategori || '(boş)'}`);
      console.log(`   Marka: ${row.marka || '(boş)'}`);
      console.log(`   Hizmet Adı: ${row.hizmet_adi || '(boş)'}`);
      console.log(`   Hizmet ID: ${row.hizmet_id || '(boş)'}`);
      console.log(`   ID: ${row.id}\n`);
    });
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkEmptyHizmetAdi();
