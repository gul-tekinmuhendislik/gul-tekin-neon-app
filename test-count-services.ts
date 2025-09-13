import { sql } from './lib/db';

async function countServices() {
  try {
    const result = await sql`
      SELECT COUNT(*) as total
      FROM hizmetler
      WHERE aktif = true
    `;

    console.log('Toplam aktif hizmet sayısı:', result[0].total);

    const allServices = await sql`
      SELECT hizmet_adi
      FROM hizmetler
      WHERE aktif = true
      ORDER BY hizmet_adi
    `;

    console.log('\nTüm hizmetler:');
    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.hizmet_adi}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

countServices();