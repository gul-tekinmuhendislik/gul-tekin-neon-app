const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(process.cwd(), 'public', 'images', 'blog');
const MAX_WIDTH = 1200;
const QUALITY = 75;

async function optimizeImages() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

  console.log(`${files.length} resim optimize ediliyor...\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(INPUT_DIR, file.replace(/\.(jpg|jpeg|png)$/, '.webp'));

    const originalStats = fs.statSync(inputPath);
    totalOriginal += originalStats.size;

    try {
      await sharp(inputPath)
        .resize(MAX_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      totalOptimized += optimizedStats.size;

      const savings = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);
      console.log(`✓ ${file} → ${path.basename(outputPath)} (${savings}% tasarruf)`);
    } catch (error) {
      console.log(`✗ ${file} hata: ${error.message}`);
    }
  }

  console.log(`\n=== ÖZET ===`);
  console.log(`Orijinal boyut: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimize boyut: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Tasarruf: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
}

optimizeImages().catch(console.error);
