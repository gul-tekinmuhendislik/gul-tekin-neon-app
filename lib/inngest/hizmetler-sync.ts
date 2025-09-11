import { inngest } from "../inngest/client";
import { syncHizmetlerToNeon } from "../airtable-hizmetler-client";
import { sql } from "../db";

// Sync Hizmetler from Airtable to Neon - Daily at 3:30 AM
export const syncHizmetlerDaily = inngest.createFunction(
  {
    id: "sync-hizmetler-daily",
    name: "Sync Hizmetler from Airtable to Neon",
    retries: 2,
  },
  {
    cron: "30 3 * * 1", // Every Monday at 3:30 AM (weekly)
  },
  async ({ step }) => {
    console.log("Starting daily Hizmetler sync...");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-hizmetler", async () => {
      try {
        const result = await syncHizmetlerToNeon();
        
        console.log(`Sync completed: ${result.count} services synced`);
        
        return result;
      } catch (error) {
        console.error("Error during Hizmetler sync:", error);
        
        // Log the error
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.hizmetler.sync_failed',
            'scheduled_task',
            'failed',
            ${JSON.stringify({ 
              error: String(error),
              message: error instanceof Error ? error.message : 'Unknown error'
            })},
            ${JSON.stringify({
              source: 'inngest_cron',
              schedule: 'daily_3:30am',
              timestamp: new Date().toISOString()
            })}
          )
        `;
        
        throw error;
      }
    });
    
    // Step 2: Send notification if significant changes
    if (syncResult.count > 0) {
      await step.run("log-success", async () => {
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.hizmetler.sync_completed',
            'scheduled_task',
            'success',
            ${JSON.stringify({
              synced: syncResult.count,
              total: 'total' in syncResult ? syncResult.total : syncResult.count,
              timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString()
            })},
            ${JSON.stringify({
              source: 'inngest_cron',
              schedule: 'daily_3:30am',
              duration_ms: 'timestamp' in syncResult ? Date.now() - new Date(syncResult.timestamp).getTime() : 0
            })}
          )
        `;
      });

      // Step 2.1: Trigger image sync for hizmetler
      await step.run("trigger-hizmetler-image-sync", async () => {
        try {
          await inngest.send({
            name: "airtable/hizmetler.images.bulk_sync",
            data: {
              source: 'hizmetler_sync_completion',
              syncedCount: syncResult.count
            }
          });
          console.log("Triggered hizmetler image sync after successful data sync");
        } catch (error) {
          console.error("Failed to trigger hizmetler image sync:", error);
          // Don't throw - image sync failure shouldn't fail the main sync
        }
      });
    }
    
    // Step 3: Check data quality
    const dataQuality = await step.run("check-data-quality", async () => {
      const result = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN resim_url IS NOT NULL THEN 1 END) as with_image,
          COUNT(CASE WHEN seo_slug IS NOT NULL THEN 1 END) as with_slug,
          COUNT(CASE WHEN array_length(markalar, 1) > 0 THEN 1 END) as with_brands
        FROM hizmetler
        WHERE aktif = true
      `;
      
      return result[0];
    });
    
    return {
      success: true,
      synced: syncResult.count,
      total: 'total' in syncResult ? syncResult.total : syncResult.count,
      timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString(),
      dataQuality: {
        totalActive: dataQuality.total,
        withImage: dataQuality.with_image,
        withSlug: dataQuality.with_slug,
        withBrands: dataQuality.with_brands,
      }
    };
  }
);

// Manual sync trigger
export const syncHizmetlerManual = inngest.createFunction(
  {
    id: "sync-hizmetler-manual",
    name: "Manual Sync Hizmetler",
    retries: 1,
  },
  {
    event: "hizmetler/sync.requested",
  },
  async ({ event, step }) => {
    console.log("Manual Hizmetler sync requested");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-hizmetler", async () => {
      try {
        const result = await syncHizmetlerToNeon();
        
        console.log(`Manual sync completed: ${result.count} services synced`);
        
        return result;
      } catch (error) {
        console.error("Error during manual Hizmetler sync:", error);
        throw error;
      }
    });
    
    // Step 2: Log the manual sync
    await step.run("log-manual-sync", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'inngest.hizmetler.manual_sync',
          'user_action',
          'success',
          ${JSON.stringify({
            synced: syncResult.count,
            total: 'total' in syncResult ? syncResult.total : syncResult.count,
            timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString(),
            triggeredBy: event.data?.userId || 'api'
          })},
          ${JSON.stringify({
            source: 'manual_trigger',
            requestId: event.id
          })}
        )
      `;
    });
    
    return {
      success: true,
      synced: syncResult.count,
      total: 'total' in syncResult ? syncResult.total : syncResult.count,
      timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString(),
    };
  }
);