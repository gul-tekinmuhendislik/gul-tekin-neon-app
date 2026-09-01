const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MAX_WIDTH = 1200;
const QUALITY = 75;

async function optimizeAllImages() {
  const files = [];

  // Tüm resim dosyalarını bul
  function findImages(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // node_modules ve .next klasörlerini atla
        if (!item.includes('node_modules') && !item.includes('.next')) {
          findImages(fullPath);
        }
      } else if (/\.(jpg|jpeg|png)$/i.test(item)) {
        if (stat.size > 100 * 1024) { // Sadece 100KB'dan büyük olanları optimize et
          files.push(fullPath);
        }
      }
    }
  }

  findImages(PUBLIC_DIR);

  console.log(`${files.length} büyük resim bulundu, optimize ediliyor...\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let optimizedCount = 0;

  for (const inputPath of files) {
    const ext = path.extname(inputPath).toLowerCase();
    const baseName = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    const outputPath = path.join(dir, `${baseName}.webp`);

    // Zaten WebP versiyonu varsa atla
    if (fs.existsSync(outputPath)) {
      console.log(`⊘ ${path.relative(PUBLIC_DIR, inputPath)} - WebP zaten mevcut`);
      continue;
    }

    const originalStats = fs.statSync(inputPath);
    totalOriginal += originalStats.size;

    try {
      await sharp(inputPath)
        .resize(MAX_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      totalOptimized += optimizedStats.size;
      optimizedCount++;

      const savings = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);
      console.log(`✓ ${path.relative(PUBLIC_DIR, inputPath)} → ${path.basename(outputPath)} (${savings}% tasarruf)`);
    } catch (error) {
      console.log(`✗ ${path.relative(PUBLIC_DIR, inputPath)} hata: ${error.message}`);
    }
  }

  console.log(`\n=== ÖZET ===`);
  console.log(`Optimize edilen: ${optimizedCount} resim`);
  console.log(`Orijinal boyut: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimize boyut: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  if (totalOriginal > 0) {
    console.log(`Tasarruf: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
  }
}

optimizeAllImages().catch(console.error);
