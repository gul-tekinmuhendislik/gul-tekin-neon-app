/* Exports the Neon tables read by lib/static-data.ts into data/static/*.json.
 * Usage: npm run export:tables   (requires DATABASE_URL in .env.local) */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');

const root = process.cwd();
dotenv.config({ path: path.join(root, '.env.local') });

// static file name -> source table
const TABLES = {
  urunler: 'urunler',
  hizmetler: 'hizmetler',
  markalar: 'markalar',
  projeler: 'projeler_gul_tekin',
  blog_posts: 'blog_posts',
  generated_content: 'generated_content',
  hizmet_lokasyonlari: 'hizmet_lokasyonlari',
  mahalleler: 'mahalleler',
  faq: 'faq',
  navigation_menu: 'navigation_menu',
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to export static tables');
  }
  const sql = neon(process.env.DATABASE_URL);
  const outDir = path.join(root, 'data', 'static');
  fs.mkdirSync(outDir, { recursive: true });

  for (const [name, table] of Object.entries(TABLES)) {
    const rows = await sql.query(`SELECT * FROM "${table}"`);
    fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    console.log(`${table} -> data/static/${name}.json (${rows.length} rows)`);
  }
}

main().catch((error) => {
  console.error('Static table export failed:', error.message);
  process.exit(1);
});
