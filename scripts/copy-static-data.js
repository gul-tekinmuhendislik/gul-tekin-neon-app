const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.cwd(), 'data', 'static');
const targetDir = path.join(process.cwd(), 'public', 'static-data');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const src = path.join(sourceDir, file);
  const dst = path.join(targetDir, file);
  fs.copyFileSync(src, dst);
  console.log(`Copied ${file} -> public/static-data/${file}`);
}

console.log(`\nCopied ${files.length} static data files to public/static-data/`);
