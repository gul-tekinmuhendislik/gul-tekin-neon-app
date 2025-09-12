import { inngest } from "../inngest/client";
import { syncUrunlerToNeon } from "../airtable-urunler-client";
import { sql } from "../db";

// Sync Urunler from Airtable to Neon - Daily at 3 AM
export const syncUrunlerDaily = inngest.createFunction(
  {
    id: "sync-urunler-daily",
    name: "Sync Urunler from Airtable to Neon",
    retries: 2,
  },
  {
    cron: "30 4 * * 1", // Every Monday at 4:30 AM (weekly)
  },
  async ({ step }) => {
    console.log("Starting daily Urunler sync...");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-urunler", async () => {
      try {
        const result = await syncUrunlerToNeon();
        
        console.log(`Sync completed: ${'inserted' in result ? result.inserted + result.updated : 0} products synced`);
        
        return result;
      } catch (error) {
        console.error("Error during Urunler sync:", error);
        
        // Log the error
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.urunler.sync_failed',
            'scheduled_task',
            'failed',
            ${JSON.stringify({ 
              error: String(error),
              message: error instanceof Error ? error.message : 'Unknown error'
            })},
            ${JSON.stringify({
              source: 'inngest_cron',
              schedule: 'daily_3am',
              timestamp: new Date().toISOString()
            })}
          )
        `;
        
        throw error;
      }
    });
    
    // Step 2: Send notification if significant changes
    const syncCount = 'inserted' in syncResult ? syncResult.inserted + syncResult.updated : 0;
    if (syncCount > 0) {
      await step.run("log-success", async () => {
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.urunler.sync_completed',
            'scheduled_task',
            'success',
            ${JSON.stringify({
              synced: syncCount,
              total: 'total' in syncResult ? syncResult.total : syncCount,
              timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString()
            })},
            ${JSON.stringify({
              source: 'inngest_cron',
              schedule: 'daily_3am',
              duration_ms: 'timestamp' in syncResult ? Date.now() - new Date(syncResult.timestamp).getTime() : 0
            })}
          )
        `;
      });

      // Step 2.1: Trigger image sync for urunler
      await step.run("trigger-urunler-image-sync", async () => {
        try {
          await inngest.send({
            name: "airtable/urunler.images.bulk_sync",
            data: {
              source: 'urunler_sync_completion',
              syncedCount: syncCount
            }
          });
          console.log("Triggered urunler image sync after successful data sync");
        } catch (error) {
          console.error("Failed to trigger urunler image sync:", error);
          // Don't throw - image sync failure shouldn't fail the main sync
        }
      });
    }
    
    // Step 3: Check data quality
    const dataQuality = await step.run("check-data-quality", async () => {
      const result = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN gorsel_url IS NOT NULL THEN 1 END) as with_image,
          COUNT(CASE WHEN fiyat IS NOT NULL THEN 1 END) as with_price,
          COUNT(CASE WHEN stokta = true THEN 1 END) as in_stock,
          COUNT(CASE WHEN sku IS NOT NULL THEN 1 END) as with_sku
        FROM urunler
        WHERE aktif = true
      `;
      
      return result[0];
    });
    
    return {
      success: true,
      synced: syncCount,
      total: 'total' in syncResult ? syncResult.total : syncCount,
      timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString(),
      dataQuality: {
        totalActive: dataQuality.total,
        withImage: dataQuality.with_image,
        withPrice: dataQuality.with_price,
        inStock: dataQuality.in_stock,
        withSku: dataQuality.with_sku,
      }
    };
  }
);

// Manual sync trigger
export const syncUrunlerManual = inngest.createFunction(
  {
    id: "sync-urunler-manual",
    name: "Manual Sync Urunler",
    retries: 1,
  },
  {
    event: "urunler/sync.requested",
  },
  async ({ event, step }) => {
    console.log("Manual Urunler sync requested");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-urunler", async () => {
      try {
        const result = await syncUrunlerToNeon();
        
        console.log(`Manual sync completed: ${'inserted' in result ? result.inserted + result.updated : 0} products synced`);
        
        return result;
      } catch (error) {
        console.error("Error during manual Urunler sync:", error);
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
          'inngest.urunler.manual_sync',
          'user_action',
          'success',
          ${JSON.stringify({
            synced: 'inserted' in syncResult ? syncResult.inserted + syncResult.updated : 0,
            total: 'total' in syncResult ? syncResult.total : 0,
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
      synced: 'inserted' in syncResult ? syncResult.inserted + syncResult.updated : 0,
      total: 'total' in syncResult ? syncResult.total : 0,
      timestamp: 'timestamp' in syncResult ? syncResult.timestamp : new Date().toISOString(),
    };
  }
);