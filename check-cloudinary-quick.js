#!/usr/bin/env node

const https = require('https');
require('dotenv').config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

console.log('🖼️  Cloudinary Quick Analysis');
console.log('='.repeat(50) + '\n');

const callAPI = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

(async () => {
  try {
    // 1. Usage stats
    console.log('📊 Account Usage:\n');
    const usage = await callAPI(`/v1_1/${CLOUD_NAME}/usage`);
    
    console.log(`  • API Requests: ${usage.requests || 0}`);
    if (usage.storage) {
      const storageGB = usage.storage.limit ? (usage.storage.limit / (1024*1024*1024)).toFixed(2) : 'Unlimited';
      const usedGB = usage.storage.used_bytes ? (usage.storage.used_bytes / (1024*1024*1024)).toFixed(3) : '?';
      console.log(`  • Storage: ${usedGB} GB / ${storageGB} GB`);
    }
    if (usage.bandwidth) {
      const bwGB = usage.bandwidth.limit ? (usage.bandwidth.limit / (1024*1024*1024)) : 'Unlimited';
      const usedBw = usage.bandwidth.used_bytes ? (usage.bandwidth.used_bytes / (1024*1024*1024)).toFixed(3) : '?';
      console.log(`  • Bandwidth: ${usedBw} GB / ${bwGB} GB`);
    }
    if (usage.transformations) {
      console.log(`  • Transformations: ${usage.transformations.limit || '∞'} available`);
    }
    if (usage.media_assets_count) {
      console.log(`  • Media Assets: ${usage.media_assets_count}`);
    }

    // 2. Get first batch of resources
    console.log('\n\n📷 Sampling Images (first 100):\n');
    const resources = await callAPI(`/v1_1/${CLOUD_NAME}/resources/image?max_results=100`);
    
    if (resources.total_count !== undefined) {
      console.log(`  ✅ Total Images: ${resources.total_count}`);
    }

    // Analyze folders
    const folders = {};
    const formats = {};
    let totalSize = 0;

    if (resources.resources && resources.resources.length > 0) {
      resources.resources.forEach(r => {
        const parts = r.public_id.split('/');
        const folder = parts.length > 1 ? parts[0] : '(root)';
        
        if (!folders[folder]) folders[folder] = { count: 0, size: 0 };
        folders[folder].count++;
        folders[folder].size += r.bytes || 0;
        
        const fmt = r.format || 'other';
        if (!formats[fmt]) formats[fmt] = { count: 0, size: 0 };
        formats[fmt].count++;
        formats[fmt].size += r.bytes || 0;
        
        totalSize += r.bytes || 0;
      });

      console.log(`\n📂 Folders (from sample):\n`);
      Object.entries(folders)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .forEach(([folder, data]) => {
          const sizeMB = (data.size / (1024*1024)).toFixed(2);
          console.log(`  • ${folder}: ${data.count} images (${sizeMB} MB)`);
        });

      console.log(`\n📊 Formats (from sample):\n`);
      Object.entries(formats)
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([fmt, data]) => {
          const sizeMB = (data.size / (1024*1024)).toFixed(2);
          console.log(`  • .${fmt}: ${data.count} files (${sizeMB} MB)`);
        });

      const avgSize = totalSize / resources.resources.length / 1024;
      console.log(`\n  Average file size (sample): ${avgSize.toFixed(2)} KB`);
    }

    // 3. Database analysis
    console.log('\n\n🔍 Checking database references...\n');
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Count cloudinary URLs by table
    const tables = [
      { name: 'urunler', col: 'cloudinary_url' },
      { name: 'hizmetler', col: 'cloudinary_url' },
      { name: 'projeler_gul_tekin', col: 'cloudinary_url' },
      { name: 'blog_posts', col: 'cloudinary_url' },
      { name: 'generated_images', col: 'cloudinary_url' }
    ];

    console.log(`📝 Cloudinary URLs in Database:\n`);
    for (const table of tables) {
      const result = await client.query(
        `SELECT COUNT(*) as cnt FROM "${table.name}" WHERE "${table.col}" IS NOT NULL`
      );
      const count = result.rows[0].cnt;
      console.log(`  • ${table.name}: ${count} images`);
    }

    await client.end();

    console.log('\n✨ Done!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
