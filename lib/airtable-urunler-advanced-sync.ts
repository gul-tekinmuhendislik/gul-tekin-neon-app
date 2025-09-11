import { sql } from '@/lib/db';
import { getUrunler } from './airtable-urunler-client';

// Advanced sync function that preserves Cloudinary fields
export async function advancedSyncUrunlerToNeon() {
  try {
    console.log('Starting advanced Urunler sync with Cloudinary preservation...');
    
    // Get all products from Airtable
    const airtableUrunler = await getUrunler();
    
    if (airtableUrunler.length === 0) {
      console.log('No products found in Airtable');
      return {
        success: true,
        inserted: 0,
        updated: 0,
        preserved: 0,
        message: 'No products to sync',
      };
    }
    
    // Get all existing products from database to check for updates
    const existingProducts = await sql`
      SELECT 
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        updated_at
      FROM urunler
    `;
    
    // Create a map of existing products for quick lookup
    const existingMap = new Map(
      existingProducts.map(p => [p.id, p])
    );
    
    let insertedCount = 0;
    let updatedCount = 0;
    let preservedCloudinaryCount = 0;
    
    for (const urun of airtableUrunler) {
      try {
        const gorselUrl = urun.fields.Assets?.[0]?.url || null;
        const existing = existingMap.get(urun.id);
        
        if (existing) {
          // Check if any field has changed (excluding Cloudinary fields)
          const hasChanges = 
            existing.urun_adi !== (urun.fields['Ürün Adı'] || null) ||
            existing.slug !== (urun.fields['SEO:Slug'] || null) ||
            existing.aciklama !== (urun.fields['Açıklama'] || null) ||
            existing.fiyat !== (urun.fields['Peşin Fiyat'] || null) ||
            existing.kategori !== (urun.fields['Ürün Kategorisi'] || null) ||
            existing.marka !== (urun.fields['Marka Text']?.[0] || null) ||
            existing.gorsel_url !== gorselUrl;
          
          if (hasChanges) {
            // Update existing record but preserve Cloudinary fields
            await sql`
              UPDATE urunler SET
                urun_adi = ${urun.fields['Ürün Adı'] || null},
                slug = ${urun.fields['SEO:Slug'] || null},
                aciklama = ${urun.fields['Açıklama'] || null},
                fiyat = ${urun.fields['Peşin Fiyat'] || null},
                kategori = ${urun.fields['Ürün Kategorisi'] || null},
                marka = ${urun.fields['Marka Text']?.[0] || null},
                gorsel_url = ${gorselUrl},
                agirlik = ${urun.fields['Hacim (Ton)'] || null},
                boyutlar = ${urun.fields['Depo Tipi'] || null},
                updated_at = CURRENT_TIMESTAMP,
                synced_at = ${new Date().toISOString()}
              WHERE id = ${urun.id}
            `;
            
            updatedCount++;
            
            if (existing.cloudinary_url || existing.cloudinary_public_id) {
              preservedCloudinaryCount++;
              console.log(`Updated product: ${urun.fields['Ürün Adı']} (${urun.id}) - Cloudinary fields preserved`);
            } else {
              console.log(`Updated product: ${urun.fields['Ürün Adı']} (${urun.id})`);
            }
          } else {
            console.log(`No changes for product: ${urun.fields['Ürün Adı']} (${urun.id})`);
          }
        } else {
          // Insert new record
          await sql`
            INSERT INTO urunler (
              id,
              urun_adi,
              slug,
              aciklama,
              fiyat,
              kategori,
              marka,
              sku,
              stokta,
              etiketler,
              gorsel_url,
              aktif,
              siralama_no,
              ozellikler,
              agirlik,
              boyutlar,
              airtable_created_time,
              synced_at
            ) VALUES (
              ${urun.id},
              ${urun.fields['Ürün Adı'] || null},
              ${urun.fields['SEO:Slug'] || null},
              ${urun.fields['Açıklama'] || null},
              ${urun.fields['Peşin Fiyat'] || null},
              ${urun.fields['Ürün Kategorisi'] || null},
              ${urun.fields['Marka Text']?.[0] || null},
              ${null},
              ${true},
              ${null},
              ${gorselUrl},
              ${true},
              ${999},
              ${null},
              ${urun.fields['Hacim (Ton)'] || null},
              ${urun.fields['Depo Tipi'] || null},
              ${urun.fields['Created'] || null},
              ${new Date().toISOString()}
            )
          `;
          
          insertedCount++;
          console.log(`Inserted new product: ${urun.fields['Ürün Adı']} (${urun.id})`);
        }
      } catch (error) {
        console.error(`Error syncing product ${urun.id}:`, error);
      }
    }
    
    // Check for products that exist in DB but not in Airtable (optional: mark as inactive)
    const airtableIds = new Set(airtableUrunler.map(u => u.id));
    const orphanedProducts = existingProducts.filter(p => !airtableIds.has(p.id));
    
    if (orphanedProducts.length > 0) {
      console.log(`Found ${orphanedProducts.length} products in DB that don't exist in Airtable`);
      // Optionally mark them as inactive instead of deleting
      for (const orphan of orphanedProducts) {
        await sql`
          UPDATE urunler 
          SET aktif = false, 
              updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${orphan.id}
        `;
      }
    }
    
    // Log the sync event with detailed metrics
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'airtable.urunler.advanced_sync',
        'integration',
        'success',
        ${JSON.stringify({
          totalAirtableRecords: airtableUrunler.length,
          inserted: insertedCount,
          updated: updatedCount,
          cloudinaryPreserved: preservedCloudinaryCount,
          orphaned: orphanedProducts.length,
          timestamp: new Date().toISOString(),
        })},
        ${JSON.stringify({
          source: 'advanced_sync',
          table: 'urunler',
        })}
      )
    `;
    
    console.log(`
      Advanced sync completed:
      - Total Airtable records: ${airtableUrunler.length}
      - Inserted: ${insertedCount}
      - Updated: ${updatedCount}
      - Cloudinary fields preserved: ${preservedCloudinaryCount}
      - Orphaned (marked inactive): ${orphanedProducts.length}
    `);
    
    return {
      success: true,
      total: airtableUrunler.length,
      inserted: insertedCount,
      updated: updatedCount,
      preserved: preservedCloudinaryCount,
      orphaned: orphanedProducts.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in advanced Urunler sync:', error);
    
    // Log the error
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'airtable.urunler.advanced_sync_failed',
        'integration',
        'failed',
        ${JSON.stringify({ error: String(error) })},
        ${JSON.stringify({
          source: 'advanced_sync',
          timestamp: new Date().toISOString(),
        })}
      )
    `;
    
    throw error;
  }
}

// Function to manually update Cloudinary fields for a specific product
export async function updateProductCloudinaryFields(
  productId: string,
  cloudinaryUrl: string,
  cloudinaryPublicId: string
) {
  try {
    const result = await sql`
      UPDATE urunler
      SET
        cloudinary_url = ${cloudinaryUrl},
        cloudinary_public_id = ${cloudinaryPublicId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING id, urun_adi, cloudinary_url, cloudinary_public_id
    `;
    
    if (result.length === 0) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    console.log(`Updated Cloudinary fields for product ${productId}`);
    return result[0];
  } catch (error) {
    console.error(`Error updating Cloudinary fields for product ${productId}:`, error);
    throw error;
  }
}