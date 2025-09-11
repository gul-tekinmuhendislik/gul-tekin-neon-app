import { inngest } from "./client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sql } from "@/lib/db";

interface ImageSyncData {
  id: string;
  imageUrl: string;
  type: 'marka' | 'hizmet';
  name: string;
  folder?: string;
}

// Sync single image from Airtable to Cloudinary
export const syncAirtableImageToCloudinary = inngest.createFunction(
  {
    id: "sync-airtable-image-cloudinary",
    name: "Sync Airtable Image to Cloudinary",
    retries: 3,
  },
  { event: "airtable/image.sync" },
  async ({ step, event }) => {
    const { id, imageUrl, type, name, folder } = event.data as ImageSyncData;

    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    // Step 1: Upload to Cloudinary
    const uploadResult = await step.run("upload-to-cloudinary", async () => {
      const folderPath = folder || `airtable/${type}s`;
      const publicId = `${type}-${id}`;

      const result = await uploadToCloudinary(imageUrl, {
        folder: folderPath,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        tags: ['airtable', type, 'sync'],
        transformation: [
          {
            fetch_format: 'auto',
            quality: 'auto:good',
            width: 800,
            height: 600,
            crop: 'limit'
          }
        ]
      });

      if (!result.success || !result.data) {
        throw new Error(`Cloudinary upload failed: ${result.error}`);
      }

      console.log(`Image uploaded to Cloudinary: ${result.data.url}`);
      return result;
    });

    // Step 2: Update database with Cloudinary URL
    const updateResult = await step.run("update-database", async () => {
      if (!uploadResult.data) {
        throw new Error("No upload result data available");
      }
      
      if (type === 'marka') {
        const result = await sql`
          UPDATE markalar 
          SET 
            cloudinary_url = ${uploadResult.data.url},
            cloudinary_public_id = ${uploadResult.data.public_id},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, marka_adi, cloudinary_url
        `;
        return result[0];
      } else if (type === 'hizmet') {
        const result = await sql`
          UPDATE hizmetler 
          SET 
            cloudinary_url = ${uploadResult.data.url},
            cloudinary_public_id = ${uploadResult.data.public_id},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, hizmet_adi, cloudinary_url
        `;
        return result[0];
      }
      throw new Error(`Unknown type: ${type}`);
    });

    // Step 3: Generate responsive URLs
    const responsiveUrls = await step.run("generate-responsive-urls", async () => {
      if (!uploadResult.data) {
        throw new Error("No upload result data available for responsive URLs");
      }
      
      const { getResponsiveImageUrls } = await import("@/lib/cloudinary");
      
      return getResponsiveImageUrls(uploadResult.data.public_id, [320, 640, 768, 1024, 1280]);
    });

    // Step 4: Log the sync
    await step.run("log-image-sync", async () => {
      if (!uploadResult.data) {
        throw new Error("No upload result data available for logging");
      }
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'airtable.image.synced',
          'integration',
          'success',
          ${JSON.stringify({
            id,
            type,
            name,
            originalUrl: imageUrl,
            cloudinaryUrl: uploadResult.data.url
          })},
          ${JSON.stringify({
            publicId: uploadResult.data.public_id,
            folder: 'airtable',
            bytes: uploadResult.data.bytes,
            syncedAt: new Date().toISOString()
          })}
        )
      `;
    });

    if (!uploadResult.data) {
      throw new Error("No upload result data available for return");
    }
    
    return {
      success: true,
      id,
      type,
      name,
      originalUrl: imageUrl,
      cloudinaryUrl: uploadResult.data.url,
      publicId: uploadResult.data.public_id,
      responsiveUrls,
      updatedRecord: updateResult
    };
  }
);

// Bulk sync images for all markalar
export const bulkSyncMarkalarImages = inngest.createFunction(
  {
    id: "bulk-sync-markalar-images",
    name: "Bulk Sync Markalar Images to Cloudinary",
    retries: 2,
  },
  { event: "airtable/markalar.images.bulk_sync" },
  async ({ step }) => {
    // Step 1: Get all markalar with images that need syncing
    const markalarToSync = await step.run("get-markalar-with-images", async () => {
      const result = await sql`
        SELECT id, marka_adi, logo_url, cloudinary_url
        FROM markalar
        WHERE logo_url IS NOT NULL 
          AND aktif = true
          AND (cloudinary_url IS NULL OR LENGTH(cloudinary_url) = 0)
      `;
      
      console.log(`Found ${result.length} markalar with images to sync`);
      return result;
    });

    if (markalarToSync.length === 0) {
      return {
        success: true,
        message: "No markalar images to sync",
        syncedCount: 0
      };
    }

    // Step 2: Sync images in batches of 5
    const batchSize = 5;
    let syncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < markalarToSync.length; i += batchSize) {
      const batch = markalarToSync.slice(i, i + batchSize);
      
      await step.run(`sync-batch-${Math.floor(i / batchSize) + 1}`, async () => {
        const syncPromises = batch.map(async (marka) => {
          try {
            await inngest.send({
              name: "airtable/image.sync",
              data: {
                id: marka.id,
                imageUrl: marka.logo_url,
                type: 'marka' as const,
                name: marka.marka_adi,
                folder: 'airtable/markalar'
              }
            });
            syncedCount++;
            console.log(`Triggered sync for marka: ${marka.marka_adi}`);
          } catch (error) {
            failedCount++;
            console.error(`Failed to trigger sync for marka ${marka.id}:`, error);
          }
        });

        await Promise.all(syncPromises);
        
        // Wait between batches to avoid rate limiting
        if (i + batchSize < markalarToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      });
    }

    // Step 3: Log bulk sync completion
    await step.run("log-bulk-sync", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'airtable.markalar.images.bulk_synced',
          'bulk_operation',
          'success',
          ${JSON.stringify({
            totalFound: markalarToSync.length,
            syncTriggered: syncedCount,
            failed: failedCount
          })},
          ${JSON.stringify({
            batchSize,
            completedAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      totalFound: markalarToSync.length,
      syncTriggered: syncedCount,
      failed: failedCount,
      message: `Triggered sync for ${syncedCount} marka images`
    };
  }
);

// Bulk sync images for all hizmetler
export const bulkSyncHizmetlerImages = inngest.createFunction(
  {
    id: "bulk-sync-hizmetler-images",
    name: "Bulk Sync Hizmetler Images to Cloudinary",
    retries: 2,
  },
  { event: "airtable/hizmetler.images.bulk_sync" },
  async ({ step }) => {
    // Step 1: Get all hizmetler with images that need syncing
    const hizmetlerToSync = await step.run("get-hizmetler-with-images", async () => {
      const result = await sql`
        SELECT id, hizmet_adi, resim_url, cloudinary_url
        FROM hizmetler
        WHERE resim_url IS NOT NULL 
          AND aktif = true
          AND (cloudinary_url IS NULL OR LENGTH(cloudinary_url) = 0)
      `;
      
      console.log(`Found ${result.length} hizmetler with images to sync`);
      return result;
    });

    if (hizmetlerToSync.length === 0) {
      return {
        success: true,
        message: "No hizmetler images to sync",
        syncedCount: 0
      };
    }

    // Step 2: Sync images in batches of 5
    const batchSize = 5;
    let syncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < hizmetlerToSync.length; i += batchSize) {
      const batch = hizmetlerToSync.slice(i, i + batchSize);
      
      await step.run(`sync-batch-${Math.floor(i / batchSize) + 1}`, async () => {
        const syncPromises = batch.map(async (hizmet) => {
          try {
            await inngest.send({
              name: "airtable/image.sync",
              data: {
                id: hizmet.id,
                imageUrl: hizmet.resim_url,
                type: 'hizmet' as const,
                name: hizmet.hizmet_adi,
                folder: 'airtable/hizmetler'
              }
            });
            syncedCount++;
            console.log(`Triggered sync for hizmet: ${hizmet.hizmet_adi}`);
          } catch (error) {
            failedCount++;
            console.error(`Failed to trigger sync for hizmet ${hizmet.id}:`, error);
          }
        });

        await Promise.all(syncPromises);
        
        // Wait between batches to avoid rate limiting
        if (i + batchSize < hizmetlerToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      });
    }

    // Step 3: Log bulk sync completion
    await step.run("log-bulk-sync", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'airtable.hizmetler.images.bulk_synced',
          'bulk_operation',
          'success',
          ${JSON.stringify({
            totalFound: hizmetlerToSync.length,
            syncTriggered: syncedCount,
            failed: failedCount
          })},
          ${JSON.stringify({
            batchSize,
            completedAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      totalFound: hizmetlerToSync.length,
      syncTriggered: syncedCount,
      failed: failedCount,
      message: `Triggered sync for ${syncedCount} hizmet images`
    };
  }
);

// Scheduled function to sync images daily
export const dailyImageSync = inngest.createFunction(
  {
    id: "daily-airtable-image-sync",
    name: "Daily Airtable Image Sync to Cloudinary",
    retries: 1,
  },
  {
    cron: "0 4 * * *", // Every day at 4 AM
  },
  async ({ step }) => {
    console.log("Starting daily image sync...");

    // Step 1: Trigger markalar image sync
    const markalarSync = await step.run("trigger-markalar-image-sync", async () => {
      return await inngest.send({
        name: "airtable/markalar.images.bulk_sync",
        data: {
          source: 'daily_cron'
        }
      });
    });

    // Step 2: Wait a bit and trigger hizmetler image sync
    await step.sleep("wait-between-syncs", "30s");

    const hizmetlerSync = await step.run("trigger-hizmetler-image-sync", async () => {
      return await inngest.send({
        name: "airtable/hizmetler.images.bulk_sync",
        data: {
          source: 'daily_cron'
        }
      });
    });

    // Step 3: Log the daily sync trigger
    await step.run("log-daily-sync", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'airtable.images.daily_sync_triggered',
          'scheduled_task',
          'success',
          ${JSON.stringify({
            markalarSyncTriggered: !!markalarSync,
            hizmetlerSyncTriggered: !!hizmetlerSync
          })},
          ${JSON.stringify({
            schedule: 'daily_4am',
            triggeredAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      markalarSyncTriggered: !!markalarSync,
      hizmetlerSyncTriggered: !!hizmetlerSync,
      message: "Daily image sync triggers sent"
    };
  }
);