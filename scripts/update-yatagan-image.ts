import { sql } from '../lib/db';

async function updateYataganImage() {
  try {
    // Yatağan lokasyonunu kontrol et
    const lokasyonlar = await sql`
      SELECT id, ilce_adi, slug, resim_url
      FROM hizmet_lokasyonlari
      WHERE ilce_adi ILIKE '%yatağan%' OR ilce_adi ILIKE '%yatagan%'
    `;

    console.log('Mevcut Yatağan kayıtları:', lokasyonlar);

    if (lokasyonlar.length === 0) {
      console.log('Yatağan lokasyonu bulunamadı.');
      return;
    }

    // Resmi güncelle
    const result = await sql`
      UPDATE hizmet_lokasyonlari
      SET resim_url = '/3d8182fb-45c7-4511-2f44-44d3252dccec.jpg',
          updated_at = NOW()
      WHERE ilce_adi ILIKE '%yatağan%' OR ilce_adi ILIKE '%yatagan%'
      RETURNING id, ilce_adi, slug, resim_url
    `;

    console.log('Güncellenen kayıtlar:', result);
  } catch (error) {
    console.error('Hata:', error);
  }
}

updateYataganImage();
