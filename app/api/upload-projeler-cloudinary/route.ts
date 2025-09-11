import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Airtable from 'airtable';
import { v2 as cloudinary } from 'cloudinary';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

interface ProjeRecord {
  id?: string;
  fields: {
    'Proje Adı'?: string;
    'SEO:slug'?: string;
    'Açıklama'?: string;
    'Mahalle Adı'?: string;
    'İlçe Adı'?: string;
    'Proje Başlangıç Tarihi'?: string;
    'Proje Bitiş Tarihi'?: string;
    'Proje Yılı'?: string;
    'Ana faaliyet Konusu'?: string[];
    'Resimler'?: Array<{ 
      id?: string; 
      url: string; 
      filename: string; 
    }>;
    'Last Modified'?: string;
  };
}

async function uploadToCloudinary(imageUrl: string, publicId: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'projeler',
      resource_type: 'auto',
      overwrite: true,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log(`Starting Cloudinary upload for projeler (limit: ${limit})...`);
    
    // Fetch records from Airtable
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const records: ProjeRecord[] = [];
    
    await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        view: 'Grid view',
        maxRecords: limit,
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push({
            id: record.id,
            fields: record.fields as ProjeRecord['fields'],
          });
        });
        if (records.length < limit) {
          fetchNextPage();
        }
      });

    console.log(`Processing ${records.length} projects...`);
    
    let uploadedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const record of records) {
      if (!record.id) continue;
      
      const { fields } = record;
      const resimler = fields['Resimler'];
      
      // Skip if no images
      if (!resimler || resimler.length === 0) {
        skippedCount++;
        console.log(`No images for: ${fields['Proje Adı']}`);
        continue;
      }
      
      // Check if already has cloudinary URL in database
      const existing = await sql`
        SELECT cloudinary_url 
        FROM projeler_gul_tekin 
        WHERE airtable_id = ${record.id}
          AND cloudinary_url IS NOT NULL
      `;
      
      if (existing.length > 0 && existing[0].cloudinary_url) {
        skippedCount++;
        console.log(`Already has cloudinary URL: ${fields['Proje Adı']}`);
        continue;
      }
      
      // Get the first image from Resimler field
      const airtableImageUrl = resimler[0].url;
      const slug = fields['SEO:slug'] || 
                  fields['Proje Adı']?.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '') || 
                  record.id;
      
      // Generate public_id for Cloudinary
      const publicId = `proje-${slug}-${record.id?.substring(0, 6)}`;
      
      console.log(`Uploading image for: ${fields['Proje Adı']}`);
      
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(airtableImageUrl, publicId);
      
      if (cloudinaryResult) {
        // Update database with Cloudinary URLs
        await sql`
          UPDATE projeler_gul_tekin
          SET 
            cloudinary_url = ${cloudinaryResult.url},
            cloudinary_public_id = ${cloudinaryResult.publicId},
            updated_at = NOW()
          WHERE airtable_id = ${record.id}
        `;
        
        uploadedCount++;
        results.push({
          project: fields['Proje Adı'],
          cloudinaryUrl: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId,
        });
        
        console.log(`✓ Uploaded: ${fields['Proje Adı']}`);
      } else {
        console.log(`✗ Failed to upload: ${fields['Proje Adı']}`);
      }
    }
    
    // Get final stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(cloudinary_url) as with_cloudinary,
        COUNT(NULLIF(cloudinary_url, '')) as non_empty_cloudinary
      FROM projeler_gul_tekin
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary upload completed',
      results: {
        processed: records.length,
        uploaded: uploadedCount,
        skipped: skippedCount,
        uploads: results,
        databaseStats: stats[0],
      },
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}