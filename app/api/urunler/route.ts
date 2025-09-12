import { NextResponse } from 'next/server';
import { getUrunlerFromNeon, syncUrunlerToNeon } from '@/lib/airtable-urunler-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'sync') {
      const result = await syncUrunlerToNeon();
      return NextResponse.json(result);
    }

    const urunler = await getUrunlerFromNeon();
    return NextResponse.json({
      success: true,
      data: urunler,
      count: urunler.length
    });
  } catch (error) {
    console.error('Error in /api/urunler:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}