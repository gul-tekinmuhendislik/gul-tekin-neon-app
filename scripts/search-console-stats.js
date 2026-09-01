const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Decode service account key
const serviceAccountKey = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
);

// Site URL from env - try different formats
const SITE_URLS = [
  'sc-domain:gul-tekinmuhendislik.com',
  'https://gul-tekinmuhendislik.com',
  'https://www.gul-tekinmuhendislik.com',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://gul-tekinmuhendislik.com',
];

async function main() {
  console.log('=== GOOGLE SEARCH CONSOLE ISTATISTIKLERI ===\n');

  // Create auth client
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchConsole = google.webmasters({
    version: 'v3',
    auth: auth,
  });

  // Date range - last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const formatDate = (date) => date.toISOString().split('T')[0];

  // Find the correct site URL
  let SITE_URL = null;

  // First, list all available sites
  console.log('--- ERIŞILEBILIR SITELER ---');
  try {
    const sitesList = await searchConsole.sites.list({});
    if (sitesList.data.siteEntry && sitesList.data.siteEntry.length > 0) {
      sitesList.data.siteEntry.forEach(site => {
        console.log(`  - ${site.siteUrl} (${site.permissionLevel})`);
        if (!SITE_URL && site.siteUrl.includes('gul-tekin')) {
          SITE_URL = site.siteUrl;
        }
      });
    } else {
      console.log('  Hiç site bulunamadı.');
    }
  } catch (e) {
    console.log('  Site listesi alınamadı:', e.message);
  }

  if (!SITE_URL) {
    console.log('\nGül-Tekin site bulunamadı. Service account\'un Search Console\'da eklendiğinden emin ol.');
    process.exit(1);
  }

  console.log(`\nSeçilen Site: ${SITE_URL}`);
  console.log(`Tarih Araligi: ${formatDate(startDate)} - ${formatDate(endDate)}\n`);

  try {
    // 1. Overall performance
    console.log('--- GENEL PERFORMANS ---');
    const overallData = await searchConsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['date'],
        rowLimit: 30,
      },
    });

    if (overallData.data.rows && overallData.data.rows.length > 0) {
      let totalClicks = 0;
      let totalImpressions = 0;

      overallData.data.rows.forEach(row => {
        totalClicks += row.clicks;
        totalImpressions += row.impressions;
      });

      console.log(`Toplam Tiklama: ${totalClicks}`);
      console.log(`Toplam Gosterim: ${totalImpressions}`);
      console.log(`Ortalama CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
      console.log(`Ortalama Pozisyon: ${(overallData.data.rows.reduce((sum, r) => sum + r.position, 0) / overallData.data.rows.length).toFixed(1)}`);
    }

    // 2. Top queries
    console.log('\n--- EN IYI 20 SORGU (QUERY) ---');
    const queryData = await searchConsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 20,
        orderBys: [{ field: 'clicks', desc: true }],
      },
    });

    if (queryData.data.rows && queryData.data.rows.length > 0) {
      console.log('#\tQuery\t\t\tTıkla\tGösterim\tCTR\tPozisyon');
      console.log('-'.repeat(80));
      queryData.data.rows.forEach((row, i) => {
        const query = row.keys[0].substring(0, 25).padEnd(25);
        const clicks = String(Math.round(row.clicks)).padStart(6);
        const impressions = String(Math.round(row.impressions)).padStart(8);
        const ctr = ((row.clicks / row.impressions) * 100).toFixed(1).padStart(5);
        const position = row.position.toFixed(1).padStart(6);
        console.log(`${(i+1).toString().padStart(2)}\t${query}\t${clicks}\t${impressions}\t${ctr}%\t${position}`);
      });
    } else {
      console.log('Veri bulunamadı.');
    }

    // 3. Top pages
    console.log('\n--- EN IYI 20 SAYFA ---');
    const pageData = await searchConsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: 20,
        orderBys: [{ field: 'clicks', desc: true }],
      },
    });

    if (pageData.data.rows && pageData.data.rows.length > 0) {
      console.log('#\tSayfa\t\t\t\tTıkla\tGösterim\tCTR\tPozisyon');
      console.log('-'.repeat(90));
      pageData.data.rows.forEach((row, i) => {
        const page = row.keys[0].replace(SITE_URL, '').substring(0, 30).padEnd(30);
        const clicks = String(Math.round(row.clicks)).padStart(6);
        const impressions = String(Math.round(row.impressions)).padStart(8);
        const ctr = ((row.clicks / row.impressions) * 100).toFixed(1).padStart(5);
        const position = row.position.toFixed(1).padStart(6);
        console.log(`${(i+1).toString().padStart(2)}\t${page}\t${clicks}\t${impressions}\t${ctr}%\t${position}`);
      });
    } else {
      console.log('Veri bulunamadı.');
    }

    // 4. Country breakdown
    console.log('\n--- ULKE DAGILIMI ---');
    const countryData = await searchConsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['country'],
        rowLimit: 10,
        orderBys: [{ field: 'clicks', desc: true }],
      },
    });

    if (countryData.data.rows && countryData.data.rows.length > 0) {
      console.log('#\tUlke\t\tTıkla\tGösterim');
      console.log('-'.repeat(50));
      countryData.data.rows.forEach((row, i) => {
        const country = row.keys[0].padEnd(15);
        const clicks = String(Math.round(row.clicks)).padStart(6);
        const impressions = String(Math.round(row.impressions)).padStart(8);
        console.log(`${(i+1).toString().padStart(2)}\t${country}\t${clicks}\t${impressions}`);
      });
    }

    // 5. Device breakdown
    console.log('\n--- CIHAZ DAGILIMI ---');
    const deviceData = await searchConsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['device'],
        rowLimit: 10,
      },
    });

    if (deviceData.data.rows && deviceData.data.rows.length > 0) {
      console.log('#\tCihaz\t\tTıkla\tGösterim\tCTR');
      console.log('-'.repeat(50));
      deviceData.data.rows.forEach((row, i) => {
        const device = row.keys[0].padEnd(15);
        const clicks = String(Math.round(row.clicks)).padStart(6);
        const impressions = String(Math.round(row.impressions)).padStart(8);
        const ctr = ((row.clicks / row.impressions) * 100).toFixed(1).padStart(5);
        console.log(`${(i+1).toString().padStart(2)}\t${device}\t${clicks}\t${impressions}\t${ctr}%`);
      });
    }

  } catch (error) {
    console.error('Hata:', error.message);
    if (error.response) {
      console.error('API Hatasi:', error.response.data);
    }
  }

  process.exit(0);
}

main();
