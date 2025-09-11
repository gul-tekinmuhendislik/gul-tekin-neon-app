require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');
const { sql } = require('./lib/db');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload function
async function uploadToCloudinary(file, options = {}) {
  try {
    const uploadOptions = {
      folder: options.folder || 'gul-tekin',
      resource_type: options.resource_type || 'auto',
      overwrite: options.overwrite ?? true,
      ...options
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        asset_id: result.asset_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at,
        bytes: result.bytes,
        tags: result.tags
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

console.log('Auto-syncing all remaining PROJELER images to Cloudinary...');
console.log('Processing in batches of 25 with 2-second delays\n');

async function autoSyncRemaining() {
  try {
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFail = 0;
    
    while (true) {
      // Check current status
      const status = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN cloudinary_url IS NOT NULL THEN 1 END) as completed
        FROM projeler_2026
        WHERE resim_url IS NOT NULL
      `;
      
      const remaining = status[0].total - status[0].completed;
      
      if (remaining === 0) {
        console.log('\n🎉 All projects successfully synced to Cloudinary!');
        console.log(`Total processed in this session: ${totalProcessed}`);
        console.log(`Success: ${totalSuccess}, Failed: ${totalFail}`);
        break;
      }
      
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Status: ${status[0].completed}/${status[0].total} synced (${remaining} remaining)`);
      console.log(`${'='.repeat(50)}\n`);
      
      // Get next batch of projects to sync
      const projects = await sql`
        SELECT id, isim as title, resim_url as gorsel_url
        FROM projeler_2026
        WHERE resim_url IS NOT NULL 
          AND (cloudinary_url IS NULL OR LENGTH(cloudinary_url) = 0)
        ORDER BY id
        LIMIT 25
      `;
      
      console.log(`Processing next ${projects.length} projects...\n`);
      
      let batchSuccess = 0;
      let batchFail = 0;
      
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const progress = `[${i + 1}/${projects.length}]`;
        
        process.stdout.write(`${progress} ${project.title.substring(0, 40).padEnd(40)}... `);
        
        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(project.gorsel_url, {
            folder: 'airtable/projeler',
            public_id: `proje-${project.id}`,
            overwrite: true,
            resource_type: 'image',
            tags: ['airtable', 'proje', 'sync'],
            transformation: [
              {
                fetch_format: 'auto',
                quality: 'auto:good',
                width: 1200,
                height: 800,
                crop: 'limit'
              }
            ]
          });
          
          if (result.success && result.data) {
            // Update database
            await sql`
              UPDATE projeler_2026 
              SET 
                cloudinary_url = ${result.data.url},
                cloudinary_public_id = ${result.data.public_id},
                cloudinary_image_id = ${result.data.asset_id || result.data.public_id},
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ${project.id}
            `;
            
            console.log('✅');
            batchSuccess++;
            totalSuccess++;
          } else {
            console.log('❌');
            batchFail++;
            totalFail++;
          }
        } catch (error) {
          console.log('❌');
          batchFail++;
          totalFail++;
        }
        
        totalProcessed++;
        
        // Wait 2 seconds between uploads
        if (i < projects.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`\nBatch Complete: ✅ ${batchSuccess} successful, ❌ ${batchFail} failed`);
      
      // Wait 3 seconds between batches
      console.log('⏳ Waiting 3 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}

// Run the auto sync
autoSyncRemaining();