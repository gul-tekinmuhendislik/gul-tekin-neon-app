#!/usr/bin/env node

const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Basic auth for Admin API
const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

console.log('🖼️  Cloudinary Storage Analysis');
console.log('=' .repeat(50));
console.log(`Cloud Name: ${CLOUD_NAME}\n`);

// Helper function for API calls
const callCloudinaryAPI = (path) => {
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
          reject(new Error(`Invalid JSON: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

(async () => {
  try {
    // 1. Get account metadata
    console.log('📊 Fetching account metadata...\n');
    const metadata = await callCloudinaryAPI('/v1_1/' + CLOUD_NAME + '/usage');
    
    if (metadata.error) {
      console.log('⚠️  Usage API returned:', metadata.error.message);
    } else {
      console.log('📈 Account Usage:');
      console.log(`  • Total bandwidth: ${metadata.bandwidth || 'N/A'} bytes`);
      console.log(`  • Media assets: ${metadata.media_assets_count || 0}`);
      console.log(`  • Storage: ${metadata.storage || 0} bytes`);
      console.log(`  • Transformations: ${metadata.transformations || 0}`);
      console.log(`  • Objects: ${metadata.objects || 0}`);
      console.log(`  • Requests: ${metadata.requests || 0}`);
    }

    // 2. Get resources (list images)
    console.log('\n\n📷 Fetching stored images...\n');
    let allResources = [];
    let nextCursor = null;
    let pageNum = 1;

    do {
      let apiPath = `/v1_1/${CLOUD_NAME}/resources/image?max_results=500`;
      if (nextCursor) apiPath += `&next_cursor=${encodeURIComponent(nextCursor)}`;

      const response = await callCloudinaryAPI(apiPath);
      
      if (response.resources) {
        allResources = allResources.concat(response.resources);
        nextCursor = response.next_cursor;
        console.log(`  Page ${pageNum}: ${response.resources.length} images`);
        pageNum++;
      } else {
        break;
      }
    } while (nextCursor);

    console.log(`\n✅ Total images: ${allResources.length}\n`);

    // 3. Analyze by folder/tag
    console.log('📂 Images by Folder/Category:\n');

    const byFolder = {};
    const byType = {};
    let totalSize = 0;
    let totalPixels = 0;

    allResources.forEach(resource => {
      // Extract folder from public_id
      const parts = resource.public_id.split('/');
      const folder = parts.length > 1 ? parts[0] : '(root)';
      
      if (!byFolder[folder]) {
        byFolder[folder] = { count: 0, size: 0, resources: [] };
      }
      byFolder[folder].count++;
      byFolder[folder].size += resource.bytes || 0;
      byFolder[folder].resources.push(resource);

      // By format
      const format = resource.format || 'unknown';
      if (!byType[format]) {
        byType[format] = { count: 0, size: 0 };
      }
      byType[format].count++;
      byType[format].size += resource.bytes || 0;

      totalSize += resource.bytes || 0;
      totalPixels += (resource.width || 0) * (resource.height || 0);
    });

    // Print folder stats
    Object.entries(byFolder)
      .sort((a, b) => b[1].size - a[1].size)
      .forEach(([folder, data]) => {
        const sizeGB = (data.size / (1024 * 1024 * 1024)).toFixed(3);
        console.log(`  ${folder}/`);
        console.log(`    - Count: ${data.count}`);
        console.log(`    - Size: ${sizeGB} GB`);
      });

    // 4. Format analysis
    console.log('\n\n📊 Images by Format:\n');
    Object.entries(byType)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([format, data]) => {
        const sizeMB = (data.size / (1024 * 1024)).toFixed(2);
        console.log(`  .${format}`);
        console.log(`    - Count: ${data.count}`);
        console.log(`    - Size: ${sizeMB} MB`);
      });

    // 5. Size analysis
    console.log('\n\n📏 Size Statistics:\n');
    const totalGB = (totalSize / (1024 * 1024 * 1024)).toFixed(3);
    const avgSize = totalSize / allResources.length / 1024;
    console.log(`  Total Storage: ${totalGB} GB`);
    console.log(`  Average Image Size: ${avgSize.toFixed(2)} KB`);
    console.log(`  Total Megapixels: ${(totalPixels / 1000000).toFixed(1)} MP`);

    // 6. Recent uploads
    console.log('\n\n⏰ Most Recent Uploads:\n');
    const recent = allResources
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    recent.forEach((resource, i) => {
      const date = new Date(resource.created_at).toLocaleString('tr-TR');
      const sizeMB = (resource.bytes / (1024 * 1024)).toFixed(2);
      console.log(`  ${i + 1}. ${resource.public_id}`);
      console.log(`     Uploaded: ${date}`);
      console.log(`     Size: ${sizeMB} MB | ${resource.width}x${resource.height}`);
    });

    // 7. Largest images
    console.log('\n\n💾 Largest Images:\n');
    const largest = allResources
      .sort((a, b) => (b.bytes || 0) - (a.bytes || 0))
      .slice(0, 5);

    largest.forEach((resource, i) => {
      const sizeMB = (resource.bytes / (1024 * 1024)).toFixed(2);
      console.log(`  ${i + 1}. ${resource.public_id}`);
      console.log(`     Size: ${sizeMB} MB | ${resource.width}x${resource.height}`);
    });

    console.log('\n\n✨ Done!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
