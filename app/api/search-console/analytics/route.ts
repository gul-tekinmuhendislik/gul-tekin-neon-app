/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { google } from 'googleapis';

// Token'ı veritabanından al
async function getSearchConsoleToken() {
  const result = await sql`
    SELECT access_token, refresh_token
    FROM google_tokens
    WHERE platform = 'search_console'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) {
    throw new Error('No Search Console token found. Please authenticate first.');
  }

  return result[0];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'performance';
    const siteUrl = searchParams.get('site') || 'sc-domain:gul-tekinmuhendislik.com';

    // Token'ı al
    const token = await getSearchConsoleToken();

    // OAuth2 client oluştur
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/search-console/callback'
    );

    oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token
    });

    // Search Console API'yi başlat
    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    switch (action) {
      case 'sites': {
        // Tüm siteleri listele
        const response = await searchconsole.sites.list();

        return NextResponse.json({
          success: true,
          sites: response.data.siteEntry || [],
          message: 'Sites retrieved successfully'
        });
      }

      case 'performance': {
        // Son 28 günlük performans verilerini al
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 28);

        const response = await searchconsole.searchanalytics.query({
          siteUrl: siteUrl,
          requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['date', 'query', 'page'],
            dimensionFilterGroups: [],
            aggregationType: 'byPage',
            rowLimit: 100
          }
        });

        const rows = response.data.rows || [];

        // Toplam metrikleri hesapla
        const totals = {
          clicks: rows.reduce((sum, row) => sum + (row.clicks || 0), 0),
          impressions: rows.reduce((sum, row) => sum + (row.impressions || 0), 0),
          ctr: 0,
          position: 0
        };

        if (totals.impressions > 0) {
          totals.ctr = (totals.clicks / totals.impressions) * 100;
          totals.position = rows.reduce((sum, row) => sum + (row.position || 0), 0) / rows.length;
        }

        // Top queries
        const queryMap = new Map();
        rows.forEach(row => {
          const query = row.keys?.[1] || 'N/A';
          if (!queryMap.has(query)) {
            queryMap.set(query, {
              query,
              clicks: 0,
              impressions: 0,
              ctr: 0,
              position: 0,
              count: 0
            });
          }
          const data = queryMap.get(query);
          data.clicks += row.clicks || 0;
          data.impressions += row.impressions || 0;
          data.position += row.position || 0;
          data.count++;
        });

        const topQueries = Array.from(queryMap.values())
          .map(q => ({
            ...q,
            ctr: q.impressions > 0 ? (q.clicks / q.impressions) * 100 : 0,
            position: q.count > 0 ? q.position / q.count : 0
          }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 10);

        // Top pages
        const pageMap = new Map();
        rows.forEach(row => {
          const page = row.keys?.[2] || 'N/A';
          if (!pageMap.has(page)) {
            pageMap.set(page, {
              page,
              clicks: 0,
              impressions: 0,
              ctr: 0,
              position: 0,
              count: 0
            });
          }
          const data = pageMap.get(page);
          data.clicks += row.clicks || 0;
          data.impressions += row.impressions || 0;
          data.position += row.position || 0;
          data.count++;
        });

        const topPages = Array.from(pageMap.values())
          .map(p => ({
            ...p,
            page: p.page.replace(siteUrl, ''),
            ctr: p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0,
            position: p.count > 0 ? p.position / p.count : 0
          }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 10);

        return NextResponse.json({
          success: true,
          site: siteUrl,
          dateRange: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          },
          totals,
          topQueries,
          topPages,
          totalRows: rows.length
        });
      }

      case 'indexing': {
        // İndeksleme durumu
        const response = await searchconsole.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl: siteUrl,
            siteUrl: siteUrl
          }
        });

        return NextResponse.json({
          success: true,
          indexing: response.data.inspectionResult,
          message: 'Indexing status retrieved'
        });
      }

      case 'sitemaps': {
        // Sitemap'leri listele
        const response = await searchconsole.sitemaps.list({
          siteUrl: siteUrl
        });

        return NextResponse.json({
          success: true,
          sitemaps: response.data.sitemap || [],
          message: 'Sitemaps retrieved successfully'
        });
      }

      case 'mobile': {
        // Mobil kullanılabilirlik
        const response = await searchconsole.searchanalytics.query({
          siteUrl: siteUrl,
          requestBody: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            dimensions: ['device'],
            rowLimit: 10
          }
        });

        const deviceData = response.data.rows || [];
        const mobileData = deviceData.find(row => row.keys?.[0] === 'MOBILE');
        const desktopData = deviceData.find(row => row.keys?.[0] === 'DESKTOP');
        const tabletData = deviceData.find(row => row.keys?.[0] === 'TABLET');

        return NextResponse.json({
          success: true,
          devices: {
            mobile: {
              clicks: mobileData?.clicks || 0,
              impressions: mobileData?.impressions || 0,
              ctr: mobileData?.ctr || 0,
              position: mobileData?.position || 0
            },
            desktop: {
              clicks: desktopData?.clicks || 0,
              impressions: desktopData?.impressions || 0,
              ctr: desktopData?.ctr || 0,
              position: desktopData?.position || 0
            },
            tablet: {
              clicks: tabletData?.clicks || 0,
              impressions: tabletData?.impressions || 0,
              ctr: tabletData?.ctr || 0,
              position: tabletData?.position || 0
            }
          },
          message: 'Mobile usability data retrieved'
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: sites, performance, indexing, sitemaps, or mobile'
        });
    }

  } catch (error) {
    console.error('Search Console API Error:', error);

    // Token yoksa yetkilendirme linki ver
    if ((error as Error).message?.includes('No Search Console token')) {
      return NextResponse.json({
        success: false,
        error: (error as Error).message,
        authUrl: '/api/search-console/auth',
        message: 'Please authenticate with Search Console first'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Failed to fetch Search Console data',
      details: (error as any)?.response?.data
    }, { status: 500 });
  }
}

// POST - Sitemap gönder veya URL'leri indeksle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, siteUrl, data } = body;

    const token = await getSearchConsoleToken();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/search-console/callback'
    );

    oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token
    });

    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    switch (action) {
      case 'submit_sitemap': {
        const { sitemapUrl } = data;

        const response = await searchconsole.sitemaps.submit({
          siteUrl: siteUrl || process.env.NEXT_PUBLIC_SITE_URL,
          feedpath: sitemapUrl
        });

        return NextResponse.json({
          success: true,
          message: 'Sitemap submitted successfully',
          data: response.data
        });
      }

      case 'request_indexing': {
        const { url } = data;

        // URL Inspection API kullanarak indeksleme isteği
        const response = await searchconsole.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl: url,
            siteUrl: siteUrl || process.env.NEXT_PUBLIC_SITE_URL
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Indexing request submitted',
          inspectionResult: response.data.inspectionResult
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: submit_sitemap or request_indexing'
        });
    }

  } catch (error) {
    console.error('Search Console POST Error:', error);

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Failed to perform Search Console action',
      details: (error as any)?.response?.data
    }, { status: 500 });
  }
}