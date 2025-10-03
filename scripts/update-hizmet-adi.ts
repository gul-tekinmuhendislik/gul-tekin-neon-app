import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function updateHizmetAdi() {
  try {
    // Kategori -> Hizmet eşleştirmeleri
    const mapping = [
      {
        kategori: 'Isı Pompaları',
        hizmet_id: 'rec6GczLjFSsXancJ',
        hizmet_adi: 'Isı Pompaları'
      },
      {
        kategori: 'Havuz Isı Pompaları',
        hizmet_id: 'rec6GczLjFSsXancJ',
        hizmet_adi: 'Isı Pompaları'
      },
      {
        kategori: 'Pv Panel ',
        hizmet_id: 'rec8lVn7HGxumR3kc',
        hizmet_adi: 'Güneş Enerjisi'
      },
      {
        kategori: 'Küre ',
        hizmet_id: 'recfXC7aaodlnP2ov',
        hizmet_adi: 'Hidrofor Sistemleri'
      },
      {
        kategori: 'Çekvalfler',
        hizmet_id: 'recpRKl8eirJ9UsNe',
        hizmet_adi: 'Pompalar'
      }
    ];

    let totalUpdated = 0;

    for (const map of mapping) {
      const result = await sql`
        UPDATE urunler
        SET
          hizmet_adi = ${map.hizmet_adi},
          hizmet_id = ${map.hizmet_id},
          updated_at = NOW()
        WHERE kategori = ${map.kategori}
          AND (hizmet_adi IS NULL OR hizmet_adi = '')
        RETURNING id, urun_adi, kategori, hizmet_adi
      `;

      if (result.length > 0) {
        console.log(`\n✅ "${map.kategori}" → "${map.hizmet_adi}" (${result.length} kayıt)`);
        result.forEach((row: any) => {
          console.log(`   • ${row.urun_adi}`);
        });
        totalUpdated += result.length;
      }
    }

    console.log(`\n🎉 Toplam ${totalUpdated} kayıt güncellendi!`);

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

updateHizmetAdi();
