import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  try {
    const { action, type, data } = await request.json();
    
    console.log(`Testing image sync - Action: ${action}, Type: ${type}`);
    
    let result;
    
    switch (action) {
      case 'single':
        // Test single image sync
        result = await inngest.send({
          name: "airtable/image.sync",
          data: {
            id: data?.id || "test-marka-001",
            imageUrl: data?.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            type: type || "marka",
            name: data?.name || "Test Marka",
            folder: `test/${type}s`
          }
        });
        break;
        
      case 'bulk-markalar':
        // Test bulk markalar image sync
        result = await inngest.send({
          name: "airtable/markalar.images.bulk_sync",
          data: {
            source: "api_test"
          }
        });
        break;
        
      case 'bulk-hizmetler':
        // Test bulk hizmetler image sync
        result = await inngest.send({
          name: "airtable/hizmetler.images.bulk_sync",
          data: {
            source: "api_test"
          }
        });
        break;
        
      case 'markalar-sync':
        // Test markalar sync (which triggers image sync)
        result = await inngest.send({
          name: "markalar/sync.requested",
          data: {
            userId: "api-test",
            includeImages: true
          }
        });
        break;
        
      case 'hizmetler-sync':
        // Test hizmetler sync (which triggers image sync)
        result = await inngest.send({
          name: "hizmetler/sync.requested",
          data: {
            userId: "api-test",
            includeImages: true
          }
        });
        break;
        
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
          { error: 'Invalid action. Use: single, bulk-markalar, bulk-hizmetler, markalar-sync, hizmetler-sync, cloudinary-test' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `${action} image sync test triggered successfully`,
      action,
      type,
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
        'single - Test single image sync',
        'bulk-markalar - Test bulk markalar image sync',
        'bulk-hizmetler - Test bulk hizmetler image sync', 
        'markalar-sync - Test markalar data sync (with auto image sync)',
        'hizmetler-sync - Test hizmetler data sync (with auto image sync)',
        'cloudinary-test - Test basic Cloudinary upload'
      ],
      example: {
        action: 'single',
        type: 'marka',
        data: {
          id: 'test-001',
          name: 'Test Brand',
          imageUrl: 'https://example.com/image.jpg'
        }
      }
    }
  });
}