import { sql } from '../lib/db';

async function fixSEOIssues() {
  console.log('Starting SEO fixes...\n');

  // 1. Check current duplicate service descriptions
  console.log('1. Checking duplicate service descriptions:');
  const services = await sql`
    SELECT slug, hizmet_adi, LEFT(aciklama, 200) as aciklama_preview, kategori
    FROM hizmetler
    WHERE slug IN ('su-aritma-sistemleri', 'su-depolari', 'hidrofor')
    ORDER BY slug
  `;

  console.log('Current service descriptions:');
  services.forEach((s: any) => {
    console.log(`\n${s.slug}:`);
    console.log(`  Hizmet: ${s.hizmet_adi}`);
    console.log(`  Kategori: ${s.kategori}`);
    console.log(`  Açıklama: ${s.aciklama_preview}...`);
  });

  console.log('\n\n2. New unique descriptions to be applied:\n');

  // New unique descriptions
  const newDescriptions = {
    'su-aritma-sistemleri': `Gül-Tekin Mühendislik olarak Muğla, Bodrum ve çevre bölgelerde su arıtma sistemleri kurulum ve bakım hizmetleri sunuyoruz. Evsel ve endüstriyel kullanım için ters ozmoz, yumuşatma, filtrasyon ve demir-mangan arıtma sistemleri ile sağlıklı ve temiz su elde etmenizi sağlıyoruz. 20 yılı aşkın deneyimimizle su kalitesini artıran, uzun ömürlü ve TSE standartlarına uygun çözümler sunuyoruz. Ücretsiz keşif, profesyonel kurulum ve 2 yıl işçilik garantisi ile hizmetinizdeyiz.`,

    'su-depolari': `Gül-Tekin Mühendislik olarak Bodrum, Yalıkavak ve Muğla genelinde her kapasitede paslanmaz çelik, polyester ve polietilen su deposu tedarik ve montajı yapıyoruz. Hijyenik, dayanıklı ve uzun ömürlü su depolama çözümlerimiz, konutlar, oteller, restoranlar ve endüstriyel tesisler için idealdir. TSE ve CE sertifikalı, FDA onaylı gıda uyumlu malzemelerle üretilen su depolarımız, UV'ye dayanıklı ve bakım gerektirmeyen yapısıyla su kalitesini korur. Profesyonel ekibimizle ücretsiz keşif ve 2 yıl işçilik garantisi sunuyoruz.`,

    'hidrofor': `Gül-Tekin Mühendislik olarak Bodrum, Muğla ve çevre illerde hidrofor sistemleri satış, kurulum ve servis hizmetleri veriyoruz. Evler, villalar, apartmanlar ve endüstriyel tesisler için Grundfos, Wilo, DAB ve yerli marka hidroforlarla sabit su basıncı sağlıyoruz. Jet pompa, dalgıç pompa ve paket hidrofor sistemlerimiz, sessiz çalışma, enerji tasarrufu ve uzun ömürlü performans sunar. 20 yıllık deneyimimizle ihtiyaç analizi, profesyonel montaj, 2 yıl işçilik garantisi ve 7/24 teknik destek hizmeti sağlıyoruz.`
  };

  // 2. Fix schema categories
  console.log('\n3. Schema category fixes:\n');
  const categoryFixes = {
    'su-aritma-sistemleri': 'SU ARITMA VE FİLTRASYON',
    'su-depolari': 'MEKANİK SIHHİ TESİSAT',
    'hidrofor': 'MEKANİK SIHHİ TESİSAT'
  };

  Object.entries(categoryFixes).forEach(([slug, category]) => {
    console.log(`${slug} → ${category}`);
  });

  console.log('\n\nApplying fixes? (Run this script to apply)');

  // Apply fixes
  for (const [slug, description] of Object.entries(newDescriptions)) {
    const category = categoryFixes[slug];

    await sql`
      UPDATE hizmetler
      SET
        aciklama = ${description},
        kategori = ${category},
        updated_at = NOW()
      WHERE slug = ${slug}
    `;

    console.log(`✅ Updated ${slug}`);
  }

  console.log('\n\n4. Verifying changes:\n');

  const updated = await sql`
    SELECT slug, hizmet_adi, LEFT(aciklama, 100) as aciklama_preview, kategori
    FROM hizmetler
    WHERE slug IN ('su-aritma-sistemleri', 'su-depolari', 'hidrofor')
    ORDER BY slug
  `;

  updated.forEach((s: any) => {
    console.log(`\n${s.slug}:`);
    console.log(`  Kategori: ${s.kategori}`);
    console.log(`  Açıklama: ${s.aciklama_preview}...`);
  });

  console.log('\n✅ SEO fixes completed successfully!');
}

fixSEOIssues()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fixing SEO issues:', error);
    process.exit(1);
  });
