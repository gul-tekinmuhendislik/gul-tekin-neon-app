const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const locations = await sql`
    SELECT id, ilce_adi, slug, il, aciklama, resim_url, aktif
    FROM hizmet_lokasyonlari
    WHERE aktif = true
    ORDER BY sira ASC, ilce_adi ASC
  `;

  console.log(`Toplam ${locations.length} lokasyon:\n`);
  locations.forEach(l => {
    console.log(`ID: ${l.id} | ${l.ilce_adi} | Slug: ${l.slug} | Resim: ${l.resim_url ? 'VAR' : 'YOK'}`);
  });

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
