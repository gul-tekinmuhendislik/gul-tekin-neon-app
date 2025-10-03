import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function checkAktifColumn() {
  try {
    // Check if 'aktif' column exists in urunler table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'urunler'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 URUNLER TABLOSU KOLONLARI:\n');
    columns.forEach((col: any) => {
      console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '- nullable' : '- not null'}`);
    });

    // Check aktif column values
    const hasAktif = columns.some((col: any) => col.column_name === 'aktif');

    if (hasAktif) {
      const aktifStats = await sql`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN aktif = true THEN 1 ELSE 0 END) as aktif_count,
          SUM(CASE WHEN aktif IS NULL THEN 1 ELSE 0 END) as null_count
        FROM urunler
        WHERE marka IN ('Varmeks', 'LG')
      `;

      console.log('\n📊 VARMEKS & LG AKTİF DURUMU:');
      console.log(`   Toplam: ${aktifStats[0].total}`);
      console.log(`   Aktif: ${aktifStats[0].aktif_count || 0}`);
      console.log(`   NULL: ${aktifStats[0].null_count || 0}\n`);
    } else {
      console.log('\n⚠️  "aktif" kolonu bulunamadı!\n');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkAktifColumn();
