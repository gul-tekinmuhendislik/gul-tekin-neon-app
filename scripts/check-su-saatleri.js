const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== SU SAATI URUNLERI ===');
  const urunler = await sql`
    SELECT id, urun_adi, marka, kategori, slug
    FROM urunler
    WHERE urun_adi ILIKE '%su saati%'
       OR urun_adi ILIKE '%su saatleri%'
       OR kategori ILIKE '%su saati%'
       OR kategori ILIKE '%su saatleri%'
  `;
  console.log(JSON.stringify(urunler, null, 2));
  console.log('Toplam urun:', urunler.length);

  console.log('\n=== SU SAATI MARKALARI ===');
  const markalar = await sql`
    SELECT id, marka_adi, kategori, logo_url
    FROM markalar
    WHERE marka_adi ILIKE '%su saati%'
       OR marka_adi ILIKE '%su saatleri%'
       OR kategori ILIKE '%su saati%'
       OR kategori ILIKE '%su saatleri%'
  `;
  console.log(JSON.stringify(markalar, null, 2));
  console.log('Toplam marka:', markalar.length);
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
