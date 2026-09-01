const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== BAYLAN markasi tamamen siliniyor ===\n');

  const result = await sql`
    DELETE FROM markalar
    WHERE marka_adi ILIKE '%BAYLAN%'
    RETURNING id, marka_adi, kategori
  `;

  if (result.length > 0) {
    console.log(`✅ ${result.length} marka silindi:`);
    result.forEach(m => {
      console.log(`  [${m.id}] ${m.marka_adi}`);
    });
  } else {
    console.log('⚠️ BAYLAN markasi bulunamadi.');
  }

  console.log('\n=== KONTROL ===');
  const kontrol = await sql`SELECT COUNT(*) as count FROM markalar WHERE marka_adi ILIKE '%BAYLAN%'`;
  console.log('Kalan BAYLAN markasi:', kontrol[0].count);
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
