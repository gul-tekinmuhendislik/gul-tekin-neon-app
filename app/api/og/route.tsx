import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL
    const title = searchParams.get('title') || 'Gül-Tekin Mühendislik';
    const category = searchParams.get('category') || 'Mühendislik Çözümleri';
    
    // Create the image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(to bottom right, #0066cc, #004499)',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              maxWidth: '1000px',
              position: 'relative',
            }}
          >
            {/* Logo/Company Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ fontSize: '32px' }}>🔧</span>
              </div>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                Gül-Tekin Mühendislik
              </h2>
            </div>
            
            {/* Category Badge */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 20px',
                borderRadius: '20px',
                marginBottom: '30px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  color: '#ffffff',
                  fontWeight: '500',
                }}
              >
                {category}
              </span>
            </div>
            
            {/* Main Title */}
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.2,
                margin: '0 0 30px 0',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>
            
            {/* Features */}
            <div
              style={{
                display: 'flex',
                gap: '30px',
                marginTop: '40px',
              }}
            >
              {['20+ Yıl Deneyim', '500+ Proje', 'ISO 9001', 'Bodrum'].map((feature) => (
                <div
                  key={feature}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      color: '#ffffff',
                      fontWeight: '600',
                    }}
                  >
                    ✓ {feature}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Bottom Info */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                gul-tekinmuhendislik.com
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                |
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Mekanik Tesisat & Enerji Çözümleri
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG Image generation error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}