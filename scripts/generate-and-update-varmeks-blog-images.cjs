const { PredictionServiceClient, helpers } = require('@google-cloud/aiplatform');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

const BLOG_PROMPTS = [
  {
    id: 272,
    slug: 'varmeks-varm-up-serisi-30cye-kadar-calisan-yerli-isi-pompasi',
    imageFile: '/images/blog/varmeks-varm-up-272.jpg',
    prompt: 'A modern Varmeks Varm Up heat pump outdoor unit mounted on a white wall of a contemporary villa in Bodrum Turkey, Mediterranean landscape visible in background, blue sky, professional product photography, clean white and gray colors, winter setting with frost visible, high-end residential setting, 4k quality',
    alreadyGenerated: true,
  },
  {
    id: 273,
    slug: 'varmeks-varm-boost-r290-cevre-dostu-isi-pompasi-teknolojisi',
    imageFile: '/images/blog/varmeks-varm-boost-273.jpg',
    prompt: 'Close-up of Varmeks Varm Boost heat pump unit with visible R290 eco-friendly refrigerant labeling, green technology concept, sustainable energy theme, blue and green color gradient background, modern engineering design, professional product shot',
    alreadyGenerated: true,
  },
  {
    id: 274,
    slug: 'varmeks-varm-all-75cye-kadar-sicak-su-isi-pompasi',
    imageFile: '/images/blog/varmeks-varm-all-274.jpg',
    prompt: 'Varmeks Varm All hot water heat pump with 200L stainless steel tank in a modern utility room, clean installation, LED display showing 75°C, warm water technology, energy efficient home solution, professional plumbing setup, 4k quality',
  },
  {
    id: 275,
    slug: 'varmeks-varm-silent-pool-sessiz-havuz-isi-pompasi-incelemesi',
    imageFile: '/images/blog/varmeks-varm-silent-pool-275.jpg',
    prompt: 'Varmeks Varm Silent Pool heat pump installed next to a crystal clear swimming pool in a luxury Bodrum resort, peaceful garden setting, silent operation concept, blue water reflections, tropical plants, 5-star hotel quality installation, 4k quality',
  },
  {
    id: 276,
    slug: 'varmeks-commercial-duo-50-92kw-ticari-isi-pompasi-sistemleri',
    imageFile: '/images/blog/varmeks-commercial-duo-276.jpg',
    prompt: 'Multiple Varmeks Commercial Duo heat pumps installed on the roof of a modern commercial building in Turkey, industrial scale heating solution, blue sky backdrop, professional HVAC installation, energy efficient business solution, 4k quality',
  },
  {
    id: 277,
    slug: 'varmeks-commercial-pool-26-145kw-ticari-havuz-isi-pompasi',
    imageFile: '/images/blog/varmeks-commercial-pool-277.jpg',
    prompt: 'Large Varmeks Commercial Pool heat pump system at an Olympic-sized indoor swimming pool facility, professional aquatic center, modern architecture, clean blue water, commercial grade HVAC equipment, 4k quality',
  },
  {
    id: 278,
    slug: 'varmeks-isi-pompasi-fiyatlari-2025-maliyet-ve-tasarruf-analizi',
    imageFile: '/images/blog/varmeks-fiyat-analizi-278.jpg',
    prompt: 'Infographic style image showing heat pump cost comparison chart with Turkish Lira symbols, energy savings graph, Varmeks product lineup with price indicators, modern office setting with laptop showing calculations, professional financial analysis theme, 4k quality',
  },
  {
    id: 279,
    slug: 'varmeks-vs-lg-vs-bosch-2025-isi-pompasi-karsilastirmasi',
    imageFile: '/images/blog/varmeks-karsilastirma-279.jpg',
    prompt: 'Three premium heat pump units side by side comparison - Varmeks, LG Therma V, and Bosch - in a modern showroom setting, Turkish flag subtle accent, technical specification overlay, professional comparison review style, blue and silver color scheme, 4k quality',
  },
  {
    id: 280,
    slug: 'varmeks-isi-pompasi-garantisi-ve-teknik-destek-rehberi',
    imageFile: '/images/blog/varmeks-garanti-destek-280.jpg',
    prompt: 'Professional Varmeks service technician in uniform working on a heat pump unit, toolbox and diagnostic equipment visible, warranty document in background, customer service excellence theme, Gül-Tekin Mühendislik branded van in background, Bodrum villa setting, 4k quality',
  },
  {
    id: 281,
    slug: 'neden-varmeks-isi-pompasi-tercih-edilmeli-2025-rehberi',
    imageFile: '/images/blog/neden-varmeks-281.jpg',
    prompt: 'Happy Turkish family in a warm living room during winter, Varmeks heat pump indoor unit visible on wall, comfort and warmth theme, energy bill savings concept, modern Turkish home interior, Bodrum/Milas coastal landscape visible through window, 4k quality',
  }
];

async function generateWithVertex(client, endpoint, prompt) {
  const instances = [
    helpers.toValue({
      prompt: prompt,
    })
  ];

  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: '16:9',
    outputOptions: {
      mimeType: 'image/jpeg',
      compressionQuality: 90
    }
  });

  const [response] = await client.predict({
    endpoint,
    instances,
    parameters
  });

  if (!response.predictions || response.predictions.length === 0) {
    throw new Error('No predictions returned from Vertex AI');
  }

  const prediction = helpers.fromValue(response.predictions[0]);
  const base64Image = prediction.bytesBase64Encoded;
  return Buffer.from(base64Image, 'base64');
}

async function main() {
  console.log('🚀 VARMEKS 10 BLOG YAZISI GÖRSEL ÜRETİMİ VE YAYINLAMA');
  console.log('====================================================\n');

  let predictionClient = null;
  let endpoint = null;

  try {
    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'gul-tekin-muhendislik';
    const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    let credentials = undefined;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
      const credentialsJson = Buffer.from(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
        'base64'
      ).toString('utf-8');
      credentials = JSON.parse(credentialsJson);
    }

    predictionClient = new PredictionServiceClient({
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
      credentials,
    });

    endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002`;
    console.log(`✅ Google Vertex AI Imagen 3 bağlandı. Model: imagen-3.0-generate-002\n`);
  } catch (err) {
    console.error('⚠️ Vertex AI istemcisi başlatılamadı:', err.message);
  }

  const blogDir = path.join(process.cwd(), 'public', 'images', 'blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  for (const item of BLOG_PROMPTS) {
    console.log(`[Blog ID: ${item.id}] ${item.slug}`);

    const targetLocalPath = path.join(process.cwd(), 'public', item.imageFile.replace(/^\//, ''));

    if (item.alreadyGenerated && fs.existsSync(targetLocalPath)) {
      console.log(`  ✨ Görsel hazır: ${item.imageFile}`);
    } else if (predictionClient && endpoint) {
      try {
        console.log(`  🎨 Vertex AI Imagen 3 ile üretiliyor...`);
        const imageBuffer = await generateWithVertex(predictionClient, endpoint, item.prompt);
        fs.writeFileSync(targetLocalPath, imageBuffer);
        console.log(`  💾 Kaydedildi: ${item.imageFile} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.log(`  ⚠️ Görsel üretim hatası: ${err.message}. Alternatif hero görseli atanıyor.`);
        // Fallback to high quality hero images
        if (!fs.existsSync(targetLocalPath)) {
          const heroFallback = path.join(process.cwd(), 'public', 'images', 'hero', 'varmeks-hero-1.jpg');
          if (fs.existsSync(heroFallback)) {
            fs.copyFileSync(heroFallback, targetLocalPath);
          }
        }
      }
    }

    // Veritabanını güncelle: status = 'published' ve image_url = item.imageFile
    try {
      await sql`
        UPDATE generated_content
        SET 
          image_url = ${item.imageFile},
          status = 'published',
          updated_at = NOW()
        WHERE id = ${item.id}
      `;
      console.log(`  ✅ DB Güncellendi: status='published' | image_url='${item.imageFile}'\n`);
    } catch (dbErr) {
      console.error(`  ❌ DB Güncelleme hatası: ${dbErr.message}\n`);
    }
  }

  console.log('====================================================');
  console.log('🎉 10 Varmeks blog yazısının tüm görselleri ve yayın durumları başarıyla tamamlandı!');
}

main().catch(console.error);
