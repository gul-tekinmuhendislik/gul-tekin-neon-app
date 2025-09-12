import { sql } from '@/lib/db';

// Cloudinary URL'lerini güncelleme fonksiyonu
async function updateCloudinaryUrls() {
  try {
    console.log('Cloudinary URL güncellemeleri başlıyor...');
    
    // Markalar tablosu için örnek güncellemeler
    // Buraya replace ettiğiniz resimlerin eski ve yeni URL'lerini ekleyin
    const markaUpdates = [
      // Örnek format:
      // { id: 'marka_id', cloudinary_url: 'https://res.cloudinary.com/your-cloud/image/upload/v123/folder/image.jpg' },
    ];
    
    // Hizmetler tablosu için örnek güncellemeler
    const hizmetUpdates = [
      // Örnek format:
      // { id: 'hizmet_id', cloudinary_url: 'https://res.cloudinary.com/your-cloud/image/upload/v123/folder/image.jpg' },
    ];
    
    // Markalar tablosunu güncelle
    if (markaUpdates.length > 0) {
      console.log(`${markaUpdates.length} marka güncelleniyor...`);
      for (const update of markaUpdates) {
        await sql`
          UPDATE markalar 
          SET 
            cloudinary_url = ${update.cloudinary_url},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${update.id}
        `;
        console.log(`Marka güncellendi: ${update.id}`);
      }
    }
    
    // Hizmetler tablosunu güncelle
    if (hizmetUpdates.length > 0) {
      console.log(`${hizmetUpdates.length} hizmet güncelleniyor...`);
      for (const update of hizmetUpdates) {
        await sql`
          UPDATE hizmetler 
          SET 
            cloudinary_url = ${update.cloudinary_url},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${update.id}
        `;
        console.log(`Hizmet güncellendi: ${update.id}`);
      }
    }
    
    // Mevcut Cloudinary URL'lerini listele
    console.log('\n=== Mevcut Markalar Cloudinary URL\'leri ===');
    const markalar = await sql`
      SELECT id, marka_adi, cloudinary_url 
      FROM markalar 
      WHERE cloudinary_url IS NOT NULL
      ORDER BY marka_adi
    `;
    
    markalar.forEach(marka => {
      console.log(`${marka.marka_adi}: ${marka.cloudinary_url}`);
    });
    
    console.log('\n=== Mevcut Hizmetler Cloudinary URL\'leri ===');
    const hizmetler = await sql`
      SELECT id, hizmet_adi, cloudinary_url 
      FROM hizmetler 
      WHERE cloudinary_url IS NOT NULL
      ORDER BY hizmet_adi
    `;
    
    hizmetler.forEach(hizmet => {
      console.log(`${hizmet.hizmet_adi}: ${hizmet.cloudinary_url}`);
    });
    
    console.log('\nGüncellemeler tamamlandı!');
    return { success: true };
    
  } catch (error) {
    console.error('Hata oluştu:', error);
    return { success: false, error };
  }
}

// Script'i çalıştır
if (require.main === module) {
  updateCloudinaryUrls()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { updateCloudinaryUrls };