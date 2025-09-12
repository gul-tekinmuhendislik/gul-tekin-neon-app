import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Türkçe karakterleri İngilizce karşılıklarına çevir
function turkishToEnglish(text: string): string {
  const charMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
    'â': 'a', 'Â': 'a',
    'î': 'i', 'Î': 'i',
    'û': 'u', 'Û': 'u'
  };
  
  let result = text;
  for (const [turkishChar, englishChar] of Object.entries(charMap)) {
    result = result.replace(new RegExp(turkishChar, 'g'), englishChar);
  }
  return result;
}

// Slug oluştur
function createSlug(text: string): string {
  return turkishToEnglish(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Sadece harf, rakam, boşluk ve tire bırak
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-+|-+$/g, ''); // Baş ve sondaki tireleri kaldır
}

// Unique slug oluştur
async function createUniqueSlug(baseSlug: string, projectId: number): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await sql`
      SELECT id FROM projeler_gul_tekin 
      WHERE slug = ${slug} AND id != ${projectId}
    `;
    
    if (existing.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET() {
  try {
    console.log('🔧 Starting slug fix for projeler_gul_tekin...');
    
    // Get all projects
    const projects = await sql`
      SELECT id, proje_adi, slug, mahalle, proje_yili
      FROM projeler_gul_tekin
      ORDER BY id
    `;
    
    console.log(`Found ${projects.length} projects to process`);
    
    let updatedCount = 0;
    const updates = [];
    
    for (const project of projects) {
      // Create base slug from project name
      let baseSlug = createSlug(project.proje_adi || '');
      
      // If base slug is empty or too short, add additional info
      if (!baseSlug || baseSlug.length < 3) {
        if (project.mahalle) {
          baseSlug = createSlug(`${project.proje_adi || 'proje'}-${project.mahalle}`);
        } else {
          baseSlug = createSlug(`proje-${project.id}`);
        }
      }
      
      // Create unique slug
      const newSlug = await createUniqueSlug(baseSlug, project.id);
      
      // Only update if slug has changed
      if (newSlug !== project.slug) {
        await sql`
          UPDATE projeler_gul_tekin
          SET slug = ${newSlug},
              updated_at = NOW()
          WHERE id = ${project.id}
        `;
        
        updatedCount++;
        updates.push({
          id: project.id,
          proje_adi: project.proje_adi,
          old_slug: project.slug,
          new_slug: newSlug
        });
        
        console.log(`Updated: ${project.proje_adi} | ${project.slug} -> ${newSlug}`);
      }
    }
    
    // Get sample of updated projects
    const sampleProjects = await sql`
      SELECT id, proje_adi, slug
      FROM projeler_gul_tekin
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    
    console.log(`✅ Slug fix completed. Updated ${updatedCount} projects`);
    
    return NextResponse.json({
      success: true,
      message: 'Slugs fixed successfully',
      stats: {
        total: projects.length,
        updated: updatedCount,
        unchanged: projects.length - updatedCount
      },
      updates: updates.slice(0, 20), // First 20 updates
      sampleProjects
    });
    
  } catch (error) {
    console.error('❌ Error fixing slugs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint to fix a single project's slug
export async function POST(request: Request) {
  try {
    const { projectId, customSlug } = await request.json();
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 });
    }
    
    // Get project
    const project = await sql`
      SELECT id, proje_adi, slug
      FROM projeler_gul_tekin
      WHERE id = ${projectId}
    `;
    
    if (project.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }
    
    let newSlug;
    if (customSlug) {
      // Use custom slug but ensure it's clean and unique
      const cleanSlug = createSlug(customSlug);
      newSlug = await createUniqueSlug(cleanSlug, projectId);
    } else {
      // Generate slug from project name
      const baseSlug = createSlug(project[0].proje_adi || `proje-${projectId}`);
      newSlug = await createUniqueSlug(baseSlug, projectId);
    }
    
    // Update slug
    await sql`
      UPDATE projeler_gul_tekin
      SET slug = ${newSlug},
          updated_at = NOW()
      WHERE id = ${projectId}
    `;
    
    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        proje_adi: project[0].proje_adi,
        old_slug: project[0].slug,
        new_slug: newSlug
      }
    });
    
  } catch (error) {
    console.error('Error updating slug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}