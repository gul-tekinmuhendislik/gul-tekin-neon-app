import { inngest } from "../inngest/client";
import { syncMarkalarToNeon } from "../airtable-markalar-client";
import { sql } from "../db";

// Sync Markalar from Airtable to Neon - Daily at 3 AM
export const syncMarkalarDaily = inngest.createFunction(
  {
    id: "sync-markalar-daily",
    name: "Sync Markalar from Airtable to Neon",
    retries: 2,
  },
  {
    cron: "0 3 * * *", // Every day at 3 AM
  },
  async ({ step }) => {
    console.log("Starting daily Markalar sync...");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-markalar", async () => {
      try {
        const result = await syncMarkalarToNeon();
        
        console.log(`Sync completed: ${result.count} brands synced`);
        
        return result;
      } catch (error) {
        console.error("Error during Markalar sync:", error);
        
        // Log the error
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.markalar.sync_failed',
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
            'inngest.markalar.sync_completed',
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
    }
    
    // Step 3: Check data quality
    const dataQuality = await step.run("check-data-quality", async () => {
      const result = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN logo_url IS NOT NULL THEN 1 END) as with_logo,
          COUNT(CASE WHEN website IS NOT NULL THEN 1 END) as with_website,
          COUNT(CASE WHEN yetkili_servis = true THEN 1 END) as authorized_service
        FROM markalar
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
        withLogo: dataQuality.with_logo,
        withWebsite: dataQuality.with_website,
        authorizedService: dataQuality.authorized_service,
      }
    };
  }
);

// Manual sync trigger
export const syncMarkalarManual = inngest.createFunction(
  {
    id: "sync-markalar-manual",
    name: "Manual Sync Markalar",
    retries: 1,
  },
  {
    event: "markalar/sync.requested",
  },
  async ({ event, step }) => {
    console.log("Manual Markalar sync requested");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-markalar", async () => {
      try {
        const result = await syncMarkalarToNeon();
        
        console.log(`Manual sync completed: ${result.count} brands synced`);
        
        return result;
      } catch (error) {
        console.error("Error during manual Markalar sync:", error);
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
          'inngest.markalar.manual_sync',
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