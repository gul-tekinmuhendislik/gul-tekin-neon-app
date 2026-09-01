const http = require('http');

function checkSchema(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'http://localhost:3000/urunler/varmeks-varm-up-35kw-isi-pompasi';
  console.log(`Checking: ${url}\n`);

  const html = await checkSchema(url);

  // Find all JSON-LD scripts
  const schemaMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);

  if (schemaMatches) {
    console.log(`${schemaMatches.length} JSON-LD schema bulundu:\n`);
    schemaMatches.forEach((match, i) => {
      const jsonContent = match.replace(/<[^>]+>/g, '').trim();
      console.log(`--- Schema ${i + 1} ---`);
      try {
        const parsed = JSON.parse(jsonContent);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(jsonContent);
      }
      console.log('');
    });
  } else {
    console.log('JSON-LD schema bulunamadı');
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
