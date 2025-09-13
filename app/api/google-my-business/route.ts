import { NextRequest, NextResponse } from 'next/server';
import { gmb } from '@/lib/google-my-business';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'info':
        const businessInfo = await gmb.getBusinessInfo();
        return NextResponse.json({ success: true, data: businessInfo });

      case 'reviews':
        const reviews = await gmb.getReviews();
        return NextResponse.json({ success: true, data: reviews });

      case 'insights':
        const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
        const insights = await gmb.getInsights(startDate, endDate);
        return NextResponse.json({ success: true, data: insights });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google My Business API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data from Google My Business' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'updateHours':
        const { hours } = body;
        const updatedLocation = await gmb.updateBusinessHours(hours);
        return NextResponse.json({ success: true, data: updatedLocation });

      case 'post':
        const { content, mediaUrl } = body;
        const post = await gmb.postUpdate(content, mediaUrl);
        return NextResponse.json({ success: true, data: post });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google My Business API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Google My Business' },
      { status: 500 }
    );
  }
}