import { sql } from '../lib/db';

function generateSlug(text: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };

  // Türkçe karakterleri değiştir
  let slug = text;
  for (const [turkish, english] of Object.entries(turkishMap)) {
    slug = slug.replace(new RegExp(turkish, 'g'), english);
  }

  // Slug oluştur
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-+|-+$/g, ''); // Baş ve sondaki tireleri kaldır

  return slug;
}

async function addSlugField() {
  try {
    console.log('🔧 Adding slug field to generated_content table...');
    
    // 1. Slug sütunu ekle
    await sql`
      ALTER TABLE generated_content 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(500) UNIQUE
    `;
    
    console.log('✅ Slug column added successfully');
    
    // 2. Mevcut kayıtları al
    const posts = await sql`
      SELECT id, title, topic 
      FROM generated_content
      WHERE slug IS NULL
    `;
    
    console.log(`📝 Found ${posts.length} posts without slug`);
    
    // 3. Her kayıt için slug oluştur ve güncelle
    for (const post of posts) {
      const baseSlug = generateSlug(post.title || post.topic);
      let slug = baseSlug;
      let counter = 1;
      
      // Benzersiz slug oluştur
      while (true) {
        try {
          await sql`
            UPDATE generated_content 
            SET slug = ${slug}
            WHERE id = ${post.id}
          `;
          console.log(`✅ Updated post ${post.id}: ${slug}`);
          break;
        } catch (error: any) {
          if (error.code === '23505') { // Unique constraint violation
            slug = `${baseSlug}-${counter}`;
            counter++;
          } else {
            throw error;
          }
        }
      }
    }
    
    // 4. Güncel tabloyu kontrol et
    const updatedPosts = await sql`
      SELECT id, title, slug 
      FROM generated_content
      ORDER BY id
    `;
    
    console.log('\n📋 Updated posts with slugs:');
    console.table(updatedPosts);
    
  } catch (error) {
    console.error('❌ Error adding slug field:', error);
    process.exit(1);
  }
}

addSlugField().then(() => {
  console.log('✅ Slug field migration completed successfully');
  process.exit(0);
});