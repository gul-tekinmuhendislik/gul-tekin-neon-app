import { sql } from '../lib/db';

async function updateBodrumImage() {
  try {
    // Bodrum lokasyonunu kontrol et
    const lokasyonlar = await sql`
      SELECT id, ilce_adi, slug, resim_url
      FROM hizmet_lokasyonlari
      WHERE ilce_adi ILIKE '%bodrum%'
    `;

    console.log('Mevcut Bodrum kayıtları:', lokasyonlar);

    if (lokasyonlar.length === 0) {
      console.log('Bodrum lokasyonu bulunamadı.');
      return;
    }

    // Resmi güncelle
    const result = await sql`
      UPDATE hizmet_lokasyonlari
      SET resim_url = '/DJI_0025.JPG',
          updated_at = NOW()
      WHERE ilce_adi ILIKE '%bodrum%'
      RETURNING id, ilce_adi, slug, resim_url
    `;

    console.log('Güncellenen kayıtlar:', result);
  } catch (error) {
    console.error('Hata:', error);
  }
}

updateBodrumImage();
