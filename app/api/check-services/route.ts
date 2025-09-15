import { NextResponse } from 'next/server';
import { getHizmetlerFromNeon } from '@/lib/airtable-hizmetler-client';

export async function GET() {
  try {
    const services = await getHizmetlerFromNeon();

    // Filter heat pump related services
    const heatPumpServices = services.filter((service: any) => {
      const hizmetAdi = service.hizmet_adi?.toLowerCase() || '';
      const kategori = service.kategori?.toLowerCase() || '';
      return hizmetAdi.includes('ısı pompa') ||
             hizmetAdi.includes('isı pompa') ||
             kategori.includes('ısı pompa') ||
             kategori.includes('isı pompa');
    });

    const servicesWithoutSlug = heatPumpServices.filter((service: any) =>
      !service.slug && !service.seo_slug
    );

    return NextResponse.json({
      total: services.length,
      heatPumpServices: heatPumpServices.map((s: any) => ({
        id: s.id,
        hizmet_adi: s.hizmet_adi,
        kategori: s.kategori,
        slug: s.slug || null,
        seo_slug: s.seo_slug || null,
        hasSlug: !!(s.slug || s.seo_slug)
      })),
      servicesWithoutSlug: servicesWithoutSlug.length
    });
  } catch (error) {
    console.error('Error checking services:', error);
    return NextResponse.json({ error: 'Failed to check services' }, { status: 500 });
  }
}