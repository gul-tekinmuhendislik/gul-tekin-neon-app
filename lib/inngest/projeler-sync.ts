import { inngest } from "../inngest/client";
import { syncProjelerToNeon } from "../airtable-projeler-client";
import { sql } from "../db";

// Sync Projeler from Airtable to Neon - Daily at 4 AM
export const syncProjelerDaily = inngest.createFunction(
  {
    id: "sync-projeler-daily",
    name: "Sync Projeler from Airtable to Neon",
    retries: 2,
  },
  {
    cron: "0 4 * * 1", // Every Monday at 4 AM (weekly)
  },
  async ({ step }) => {
    console.log("Starting daily Projeler sync...");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-projeler", async () => {
      try {
        const result = await syncProjelerToNeon();
        
        console.log(`Sync completed: ${result.count} projects synced`);
        
        return result;
      } catch (error) {
        console.error("Error during Projeler sync:", error);
        
        // Log the error
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.projeler.sync_failed',
            'scheduled_task',
            'failed',
            ${JSON.stringify({ 
              error: String(error),
              message: error instanceof Error ? error.message : 'Unknown error'
            })},
            ${JSON.stringify({
              source: 'inngest_cron',
              schedule: 'daily_4am',
              timestamp: new Date().toISOString()
            })}
          )
        `;
        
        throw error;
      }
    });
    
    // Step 2: Send notification if significant changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((syncResult as any).count > 0) {
      await step.run("log-success", async () => {
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'inngest.projeler.sync_completed',
            'scheduled_task',
            'success',
            ${JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              synced: (syncResult as any).count,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              total: 'total' in syncResult ? (syncResult as any).total : (syncResult as any).count,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              timestamp: 'timestamp' in syncResult ? (syncResult as any).timestamp : new Date().toISOString()
            })},
            ${JSON.stringify({
              source: 'inngest_cron',
              schedule: 'daily_4am',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              duration_ms: 'timestamp' in syncResult ? Date.now() - new Date((syncResult as any).timestamp).getTime() : 0
            })}
          )
        `;
      });

      // Step 2.1: Trigger image sync for projeler
      await step.run("trigger-projeler-image-sync", async () => {
        try {
          await inngest.send({
            name: "airtable/projeler.images.bulk_sync",
            data: {
              source: 'projeler_sync_completion',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              syncedCount: (syncResult as any).count
            }
          });
          console.log("Triggered projeler image sync after successful data sync");
        } catch (error) {
          console.error("Failed to trigger projeler image sync:", error);
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
          COUNT(CASE WHEN galeri IS NOT NULL AND array_length(galeri, 1) > 0 THEN 1 END) as with_gallery,
          COUNT(CASE WHEN onemli = true THEN 1 END) as featured,
          COUNT(CASE WHEN array_length(markalar, 1) > 0 THEN 1 END) as with_brands,
          COUNT(CASE WHEN array_length(hizmetler, 1) > 0 THEN 1 END) as with_services
        FROM projeler
        WHERE aktif = true
      `;
      
      return result[0];
    });
    
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      synced: (syncResult as any).count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total: 'total' in syncResult ? (syncResult as any).total : (syncResult as any).count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timestamp: 'timestamp' in syncResult ? (syncResult as any).timestamp : new Date().toISOString(),
      dataQuality: {
        totalActive: dataQuality.total,
        withImage: dataQuality.with_image,
        withGallery: dataQuality.with_gallery,
        featured: dataQuality.featured,
        withBrands: dataQuality.with_brands,
        withServices: dataQuality.with_services,
      }
    };
  }
);

// Manual sync trigger
export const syncProjelerManual = inngest.createFunction(
  {
    id: "sync-projeler-manual",
    name: "Manual Sync Projeler",
    retries: 1,
  },
  {
    event: "projeler/sync.requested",
  },
  async ({ event, step }) => {
    console.log("Manual Projeler sync requested");
    
    // Step 1: Perform the sync
    const syncResult = await step.run("sync-projeler", async () => {
      try {
        const result = await syncProjelerToNeon();
        
        console.log(`Manual sync completed: ${result.count} projects synced`);
        
        return result;
      } catch (error) {
        console.error("Error during manual Projeler sync:", error);
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
          'inngest.projeler.manual_sync',
          'user_action',
          'success',
          ${JSON.stringify({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            synced: (syncResult as any).count,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            total: 'total' in syncResult ? (syncResult as any).total : (syncResult as any).count,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timestamp: 'timestamp' in syncResult ? (syncResult as any).timestamp : new Date().toISOString(),
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      synced: (syncResult as any).count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total: 'total' in syncResult ? (syncResult as any).total : (syncResult as any).count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timestamp: 'timestamp' in syncResult ? (syncResult as any).timestamp : new Date().toISOString(),
    };
  }
);

// Single project sync
export const syncSingleProject = inngest.createFunction(
  {
    id: "sync-single-project",
    name: "Sync Single Project from Airtable",
    retries: 1,
  },
  {
    event: "projeler/single.sync",
  },
  async ({ event, step }) => {
    const { projectId } = event.data;
    
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    
    const result = await step.run("sync-single-project", async () => {
      const { getProjeById } = await import("../airtable-projeler-client");
      
      const project = await getProjeById(projectId);
      
      if (!project || !project.id) {
        throw new Error(`Project ${projectId} not found in Airtable`);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { fields } = project as any;
      
      // Process images
      const mainImage = fields.Assets?.[0]?.url || null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const galleryImages = fields.Galeri?.map((img: any) => img.url) || [];
      
      // Update in database
      const existing = await sql`
        SELECT id FROM projeler WHERE airtable_id = ${project.id}
      `;
      
      if (existing.length > 0) {
        await sql`
          UPDATE projeler SET
            isim = ${fields.Name || ''},
            slug = ${fields.Slug || fields.Name?.toLowerCase().replace(/\s+/g, '-') || ''},
            aciklama = ${fields.Description || ''},
            musteri = ${fields.Client || ''},
            konum = ${fields.Location || ''},
            tarih = ${fields.Date || null},
            resim_url = ${mainImage},
            kategori = ${fields.Category || ''},
            hizmetler = ${fields.Services || []},
            markalar = ${fields.Brands || []},
            durum = ${fields.Status || 'Tamamlandı'},
            onemli = ${fields.Featured || false},
            galeri = ${galleryImages},
            etiketler = ${fields.Tags || []},
            aktif = ${fields.Active !== false},
            sira = ${fields.Order || 0},
            guncelleme_tarihi = NOW()
          WHERE airtable_id = ${project.id}
        `;
      } else {
        await sql`
          INSERT INTO projeler (
            airtable_id,
            isim,
            slug,
            aciklama,
            musteri,
            konum,
            tarih,
            resim_url,
            kategori,
            hizmetler,
            markalar,
            durum,
            onemli,
            galeri,
            etiketler,
            aktif,
            sira,
            olusturma_tarihi,
            guncelleme_tarihi
          ) VALUES (
            ${project.id},
            ${fields.Name || ''},
            ${fields.Slug || fields.Name?.toLowerCase().replace(/\s+/g, '-') || ''},
            ${fields.Description || ''},
            ${fields.Client || ''},
            ${fields.Location || ''},
            ${fields.Date || null},
            ${mainImage},
            ${fields.Category || ''},
            ${fields.Services || []},
            ${fields.Brands || []},
            ${fields.Status || 'Tamamlandı'},
            ${fields.Featured || false},
            ${galleryImages},
            ${fields.Tags || []},
            ${fields.Active !== false},
            ${fields.Order || 0},
            ${fields.CreatedTime || 'NOW()'},
            NOW()
          )
        `;
      }
      
      return {
        success: true,
        projectId: project.id,
        projectName: fields.Name,
      };
    });
    
    // Log the sync
    await step.run("log-single-sync", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'inngest.projeler.single_sync',
          'user_action',
          'success',
          ${JSON.stringify(result)},
          ${JSON.stringify({
            source: 'manual_trigger',
            requestId: event.id
          })}
        )
      `;
    });
    
    return result;
  }
);