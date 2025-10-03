import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function checkStock() {
  try {
    const varmeks = await sql`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN stokta = true THEN 1 ELSE 0 END) as stokta_var
      FROM urunler
      WHERE marka = 'Varmeks'
    `;

    const lg = await sql`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN stokta = true THEN 1 ELSE 0 END) as stokta_var
      FROM urunler
      WHERE marka = 'LG'
    `;

    console.log('\n📦 VARMEKS ÜRÜNLER');
    console.log(`   Toplam: ${varmeks[0].total}`);
    console.log(`   Stokta: ${varmeks[0].stokta_var || 0}\n`);

    console.log('📦 LG ÜRÜNLER');
    console.log(`   Toplam: ${lg[0].total}`);
    console.log(`   Stokta: ${lg[0].stokta_var || 0}\n`);

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkStock();
