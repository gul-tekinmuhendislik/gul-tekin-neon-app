const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== SIRA DUZELTME ===\n');

  // Doğru sırayı ayarla
  const updates = [
    { title: 'Ana Sayfa', order: 1 },
    { title: 'Ürünler', order: 2 },
    { title: 'Hizmetler', order: 3 },
    { title: 'Lokasyonlar', order: 4 },
    { title: 'Projeler', order: 5 },
    { title: 'Markalar', order: 6 },
    { title: 'Hakkımızda', order: 7 },
    { title: 'Blog', order: 8 },
    { title: 'İletişim', order: 9 },
  ];

  for (const u of updates) {
    await sql`
      UPDATE navigation_menu
      SET order_index = ${u.order}
      WHERE title = ${u.title} AND parent_id IS NULL
    `;
    console.log(`${u.order}. ${u.title}`);
  }

  console.log('\n=== SON DURUM ===');
  const items = await sql`
    SELECT title, href, order_index, parent_id
    FROM navigation_menu
    WHERE parent_id IS NULL
    ORDER BY order_index ASC
  `;

  items.forEach(i => {
    console.log(`${i.order_index}. ${i.title} (${i.href})`);
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
