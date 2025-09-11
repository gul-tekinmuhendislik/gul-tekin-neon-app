import { inngest } from "../inngest/client";
import { syncAnafaaliyetToNeon } from "../airtable-anafaaliyet-client";
import { sql } from "../db";

// Sync AnafaaLiyet from Airtable to Neon - Daily at 3 AM
export const syncAnafaaliyetDaily = inngest.createFunction(
  {
    id: "sync-anafaaliyet-daily",
    name: "Sync AnafaaLiyet from Airtable to Neon",
    retries: 2,
  },
  {
    cron: "0 3 * * 3", // Every Wednesday at 3 AM (weekly)
  },
  async ({ step }) => {
    console.log("Starting daily AnafaaLiyet sync...");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-anafaaliyet", async () => {
      try {
        const result = await syncAnafaaliyetToNeon();
        
        console.log(`Sync completed: ${result.count} activities synced`);
        
        return result;
      } catch (error) {
        console.error("Error during AnafaaLiyet sync:", error);
        
        // Log the error
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.anafaaliyet.sync_failed',
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
            'inngest.anafaaliyet.sync_completed',
            'scheduled_task',
            'success',
            ${JSON.stringify({
              synced: syncResult.count,
              total: 'total' in syncResult ? syncResult.total : syncResult.count,
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

      // Step 2.1: Trigger image sync for anafaaliyet
      await step.run("trigger-anafaaliyet-image-sync", async () => {
        try {
          await inngest.send({
            name: "airtable/anafaaliyet.images.bulk_sync",
            data: {
              source: 'anafaaliyet_sync_completion',
              syncedCount: syncResult.count
            }
          });
          console.log("Triggered anafaaliyet image sync after successful data sync");
        } catch (error) {
          console.error("Failed to trigger anafaaliyet image sync:", error);
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
          COUNT(CASE WHEN icerik IS NOT NULL THEN 1 END) as with_content,
          COUNT(CASE WHEN ozelik = true THEN 1 END) as featured,
          COUNT(CASE WHEN kategori IS NOT NULL THEN 1 END) as categorized
        FROM anafaaliyet
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
        withContent: dataQuality.with_content,
        featured: dataQuality.featured,
        categorized: dataQuality.categorized,
      }
    };
  }
);

// Manual sync trigger
export const syncAnafaaliyetManual = inngest.createFunction(
  {
    id: "sync-anafaaliyet-manual",
    name: "Manual Sync AnafaaLiyet",
    retries: 1,
  },
  {
    event: "anafaaliyet/sync.requested",
  },
  async ({ event, step }) => {
    console.log("Manual AnafaaLiyet sync requested");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-anafaaliyet", async () => {
      try {
        const result = await syncAnafaaliyetToNeon();
        
        console.log(`Manual sync completed: ${result.count} activities synced`);
        
        return result;
      } catch (error) {
        console.error("Error during manual AnafaaLiyet sync:", error);
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
          'inngest.anafaaliyet.manual_sync',
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