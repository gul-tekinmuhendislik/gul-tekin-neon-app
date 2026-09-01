const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== NAVIGATION MENU GÜNCELLEME ===\n');

  // 1. "Giriş" -> "Ana Sayfa" (ama ikon olarak gösterilecek)
  console.log('1. "Giriş" -> "Ana Sayfa"');
  const girisFix = await sql`
    UPDATE navigation_menu
    SET title = 'Ana Sayfa'
    WHERE href = '/' AND title = 'Giriş'
    RETURNING id, title, href
  `;
  console.log('   Güncellendi:', girisFix.length, 'kayıt');

  // 2. Tekil isimleri çoğula çevir
  console.log('\n2. İsimler çoğul yapılıyor...');

  const fixes = [
    { old: 'Ürün', new: 'Ürünler' },
    { old: 'Hizmet', new: 'Hizmetler' },
    { old: 'Lokasyon', new: 'Lokasyonlar' },
    { old: 'Proje', new: 'Projeler' },
    { old: 'Marka', new: 'Markalar' },
    { old: 'Biz Kimiz?', new: 'Hakkımızda' },
  ];

  for (const f of fixes) {
    const result = await sql`
      UPDATE navigation_menu
      SET title = ${f.new}
      WHERE title = ${f.old}
      RETURNING id, title, href
    `;
    if (result.length > 0) {
      console.log(`   "${f.old}" -> "${f.new}": ${result.length} güncellendi`);
    }
  }

  // 3. Duplicate order_index düzelt (Proje ve Marka ikisi de 5)
  console.log('\n3. Sıra düzeltiliyor...');
  await sql`UPDATE navigation_menu SET order_index = 4 WHERE title = 'Projeler' AND order_index = 5`;
  await sql`UPDATE navigation_menu SET order_index = 6 WHERE title = 'Markalar' AND order_index = 5`;
  console.log('   Sıra düzeltildi: Projeler=5, Markalar=6');

  // 4. Son durum
  console.log('\n=== SON DURUM ===');
  const items = await sql`
    SELECT id, title, href, order_index, is_active, parent_id
    FROM navigation_menu
    ORDER BY parent_id NULLS FIRST, order_index ASC
  `;

  const parents = items.filter(i => i.parent_id === null);
  const children = items.filter(i => i.parent_id !== null);

  parents.forEach(p => {
    const pChildren = children.filter(c => c.parent_id === p.id);
    const isHome = p.href === '/';
    const display = isHome ? `${p.title} 🏠` : p.title;
    console.log(`${p.order_index}. ${display} (${p.href})`);
    pChildren.forEach(c => {
      console.log(`   └─ ${c.title} (${c.href})`);
    });
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
