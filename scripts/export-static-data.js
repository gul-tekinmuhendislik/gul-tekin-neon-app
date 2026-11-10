const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');

function loadEnv() {
  const root = process.cwd();

  const candidates = [
    path.join(root, '.env.production.local'),
    path.join(root, '.env.local'),
    path.join(root, '.env.production'),
    path.join(root, '.env'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
    }
  }
}

async function main() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to export static data');
  }

  const sql = neon(process.env.DATABASE_URL);

  const projectResult = await sql`
    SELECT COUNT(*)::int as count FROM projeler_gul_tekin WHERE aktif = true
  `;

  const locationResult = await sql`
    SELECT COUNT(*)::int as count FROM hizmet_lokasyonlari WHERE aktif = true
  `;

  const payload = {
    projectCount: Number(projectResult[0]?.count ?? 236),
    locationCount: Number(locationResult[0]?.count ?? 13),
    updatedAt: new Date().toISOString(),
  };

  const staticDir = path.join(process.cwd(), 'data', 'static');
  fs.mkdirSync(staticDir, { recursive: true });

  const filePath = path.join(staticDir, 'home.json');
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log('Static data exported:', payload);
}

main().catch((error) => {
  console.error('Static export failed:', error);
  process.exit(1);
});
