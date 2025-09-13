import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function GET() {
  try {
    // Test için manuel senkronizasyon tetikle
    const result = await inngest.send({
      name: "google/business.sync.manual",
      data: {
        triggeredBy: 'api-test',
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Google Business sync triggered successfully',
      eventId: result.ids?.[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering Google Business sync:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test gönderi oluştur
    const result = await inngest.send({
      name: "google/post.create",
      data: {
        locationId: 'accounts/123/locations/456', // Bu değeri gerçek location ID ile değiştirin
        title: 'Gül-Tekin Mühendislik - Profesyonel Hizmetler',
        summary: 'Bodrum ve çevresinde güneş enerjisi, ısı pompası, su arıtma sistemleri kurulumu ve bakım hizmetleri. 20+ yıllık deneyimimizle yanınızdayız.',
        callToAction: {
          type: 'LEARN_MORE',
          url: 'https://gul-tekinmuhendislik.com'
        },
        imageUrl: 'https://gul-tekinmuhendislik.com/images/services.jpg'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Google Business post creation triggered',
      eventId: result.ids?.[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating Google Business post:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}