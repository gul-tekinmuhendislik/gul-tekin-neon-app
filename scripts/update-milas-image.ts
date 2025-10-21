import { sql } from '../lib/db';

async function updateMilasImage() {
  try {
    // Milas lokasyonunu kontrol et
    const lokasyonlar = await sql`
      SELECT id, ilce_adi, slug, resim_url
      FROM hizmet_lokasyonlari
      WHERE ilce_adi ILIKE '%milas%'
    `;

    console.log('Mevcut Milas kayıtları:', lokasyonlar);

    if (lokasyonlar.length === 0) {
      console.log('Milas lokasyonu bulunamadı.');
      return;
    }

    // Resmi güncelle
    const result = await sql`
      UPDATE hizmet_lokasyonlari
      SET resim_url = '/DJI_0045.jpg',
          updated_at = NOW()
      WHERE ilce_adi ILIKE '%milas%'
      RETURNING id, ilce_adi, slug, resim_url
    `;

    console.log('Güncellenen kayıtlar:', result);
  } catch (error) {
    console.error('Hata:', error);
  }
}

updateMilasImage();
