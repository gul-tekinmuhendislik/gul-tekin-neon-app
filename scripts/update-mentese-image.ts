import { sql } from '../lib/db';

async function updateMenteseImage() {
  try {
    // Menteşe lokasyonunu kontrol et
    const lokasyonlar = await sql`
      SELECT id, ilce_adi, slug, resim_url
      FROM hizmet_lokasyonlari
      WHERE ilce_adi ILIKE '%menteşe%' OR ilce_adi ILIKE '%mentese%'
    `;

    console.log('Mevcut Menteşe kayıtları:', lokasyonlar);

    if (lokasyonlar.length === 0) {
      console.log('Menteşe lokasyonu bulunamadı.');
      return;
    }

    // Resmi güncelle
    const result = await sql`
      UPDATE hizmet_lokasyonlari
      SET resim_url = '/mentese14.jpeg',
          updated_at = NOW()
      WHERE ilce_adi ILIKE '%menteşe%' OR ilce_adi ILIKE '%mentese%'
      RETURNING id, ilce_adi, slug, resim_url
    `;

    console.log('Güncellenen kayıtlar:', result);
  } catch (error) {
    console.error('Hata:', error);
  }
}

updateMenteseImage();
