const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== NAVIGATION MENU (DB) ===\n');

  const items = await sql`
    SELECT id, title, href, order_index, is_active, parent_id, icon, target
    FROM navigation_menu
    ORDER BY parent_id NULLS FIRST, order_index ASC
  `;

  // Build tree
  const parents = items.filter(i => i.parent_id === null);
  const children = items.filter(i => i.parent_id !== null);

  parents.forEach(p => {
    const pChildren = children.filter(c => c.parent_id === p.id);
    console.log(`${p.order_index}. ${p.title} (${p.href}) ${p.is_active ? '✅' : '❌'}`);
    pChildren.forEach(c => {
      console.log(`   └─ ${c.title} (${c.href}) ${c.is_active ? '✅' : '❌'}`);
    });
  });

  console.log('\n=== SAYFA YAPISI ===');
  const pages = [
    { path: '/', name: 'Ana Sayfa' },
    { path: '/urunler', name: 'Ürünler' },
    { path: '/hizmetler', name: 'Hizmetler' },
    { path: '/projeler', name: 'Projeler' },
    { path: '/markalar', name: 'Markalar' },
    { path: '/blog', name: 'Blog' },
    { path: '/hakkimizda', name: 'Hakkımızda' },
    { path: '/iletisim', name: 'İletişim' },
    { path: '/lokasyonlar', name: 'Lokasyonlar' },
    { path: '/varmeks-isi-pompalari', name: 'Varmeks Isı Pompaları' },
    { path: '/solimpeks-isi-pompalari', name: 'Solimpeks Isı Pompaları' },
  ];
  pages.forEach(p => console.log(`  ${p.path} → ${p.name}`));
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
