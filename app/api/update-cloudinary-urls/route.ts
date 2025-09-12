import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body;
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }
    
    const results = {
      markalar: { updated: 0, errors: [] as Array<{ id: string; error: string }> },
      hizmetler: { updated: 0, errors: [] as Array<{ id: string; error: string }> }
    };
    
    for (const update of updates) {
      const { table, id, cloudinary_url, cloudinary_public_id } = update;
      
      if (!table || !id || !cloudinary_url) {
        console.error('Missing required fields:', update);
        continue;
      }
      
      try {
        if (table === 'markalar') {
          await sql`
            UPDATE markalar 
            SET 
              cloudinary_url = ${cloudinary_url},
              cloudinary_public_id = ${cloudinary_public_id || null},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
          `;
          results.markalar.updated++;
          console.log(`Marka güncellendi: ${id} -> ${cloudinary_url}`);
          
        } else if (table === 'hizmetler') {
          await sql`
            UPDATE hizmetler 
            SET 
              cloudinary_url = ${cloudinary_url},
              cloudinary_public_id = ${cloudinary_public_id || null},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
          `;
          results.hizmetler.updated++;
          console.log(`Hizmet güncellendi: ${id} -> ${cloudinary_url}`);
        }
      } catch (error) {
        const errorInfo = { id, error: String(error) };
        if (table === 'markalar') {
          results.markalar.errors.push(errorInfo);
        } else {
          results.hizmetler.errors.push(errorInfo);
        }
      }
    }
    
    // Log the update event
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'cloudinary.urls.updated',
        'manual_update',
        'success',
        ${JSON.stringify(results)},
        ${JSON.stringify({
          totalUpdates: updates.length,
          timestamp: new Date().toISOString()
        })}
      )
    `;
    
    return NextResponse.json({
      success: true,
      results,
      message: `Güncelleme tamamlandı. Markalar: ${results.markalar.updated}, Hizmetler: ${results.hizmetler.updated}`
    });
    
  } catch (error) {
    console.error('Cloudinary URL update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: String(error) 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list current Cloudinary URLs
export async function GET() {
  try {
    const markalar = await sql`
      SELECT id, marka_adi, cloudinary_url, cloudinary_public_id 
      FROM markalar 
      ORDER BY marka_adi
    `;
    
    const hizmetler = await sql`
      SELECT id, hizmet_adi, cloudinary_url, cloudinary_public_id 
      FROM hizmetler 
      ORDER BY hizmet_adi
    `;
    
    return NextResponse.json({
      success: true,
      data: {
        markalar: markalar.map(m => ({
          id: m.id,
          name: m.marka_adi,
          cloudinary_url: m.cloudinary_url,
          cloudinary_public_id: m.cloudinary_public_id
        })),
        hizmetler: hizmetler.map(h => ({
          id: h.id,
          name: h.hizmet_adi,
          cloudinary_url: h.cloudinary_url,
          cloudinary_public_id: h.cloudinary_public_id
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching Cloudinary URLs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: String(error) 
      },
      { status: 500 }
    );
  }
}