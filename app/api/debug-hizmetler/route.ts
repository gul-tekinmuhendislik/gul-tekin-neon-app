import { NextResponse } from 'next/server';
import { getHizmetlerFromNeon } from '@/lib/airtable-hizmetler-client';

export async function GET() {
  try {
    const hizmetler = await getHizmetlerFromNeon();
    
    const slugs = hizmetler.map(h => ({
      id: h.id,
      hizmet_adi: h.hizmet_adi,
      slug: h.slug,
      seo_slug: h.seo_slug
    }));
    
    return NextResponse.json({
      total: hizmetler.length,
      slugs: slugs.slice(0, 10)
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}