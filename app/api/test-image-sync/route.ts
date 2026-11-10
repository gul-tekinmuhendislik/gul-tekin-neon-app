import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    console.log(`Testing image sync - Action: ${action}`);
    
    let result;
    
    switch (action) {
      case 'cloudinary-test':
        // Test basic Cloudinary upload
        result = await inngest.send({
          name: "cloudinary/upload",
          data: {
            file: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300",
            options: {
              folder: "test-uploads",
              public_id: "test-image-" + Date.now(),
              tags: ["test", "api"],
              quality: "auto:good"
            }
          }
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: cloudinary-test' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `${action} image sync test triggered successfully`,
      action,
      result: {
        ids: result.ids,
        status: 'triggered'
      }
    });
    
  } catch (error) {
    console.error('Error in image sync test:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to trigger image sync test'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image sync test endpoint',
    usage: {
      method: 'POST',
      actions: [
        'cloudinary-test - Test basic Cloudinary upload'
      ],
      example: { action: 'cloudinary-test' }
    }
  });
}