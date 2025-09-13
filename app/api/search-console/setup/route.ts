import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // SEO verilerini saklamak için tablolar oluştur

    // 1. Arama performansı tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS seo_performance (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        query TEXT,
        page TEXT,
        device VARCHAR(50),
        country VARCHAR(10),
        clicks INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        ctr DECIMAL(5,2) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(date, query, page, device, country)
      )
    `;

    // 2. Sayfa metrikleri tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS seo_pages (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        title TEXT,
        meta_description TEXT,
        indexed BOOLEAN DEFAULT false,
        mobile_friendly BOOLEAN DEFAULT true,
        load_time DECIMAL(5,2),
        core_web_vitals JSONB,
        last_crawled TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. Anahtar kelime takibi
    await sql`
      CREATE TABLE IF NOT EXISTS seo_keywords (
        id SERIAL PRIMARY KEY,
        keyword TEXT NOT NULL,
        page_url TEXT,
        current_position DECIMAL(5,2),
        previous_position DECIMAL(5,2),
        best_position DECIMAL(5,2),
        search_volume INTEGER,
        difficulty INTEGER,
        tracked_since DATE DEFAULT CURRENT_DATE,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(keyword, page_url)
      )
    `;

    // 4. Backlink takibi
    await sql`
      CREATE TABLE IF NOT EXISTS seo_backlinks (
        id SERIAL PRIMARY KEY,
        source_url TEXT NOT NULL,
        target_url TEXT NOT NULL,
        anchor_text TEXT,
        follow BOOLEAN DEFAULT true,
        domain_authority INTEGER,
        first_seen DATE DEFAULT CURRENT_DATE,
        last_checked TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active',
        UNIQUE(source_url, target_url)
      )
    `;

    // 5. Site hataları
    await sql`
      CREATE TABLE IF NOT EXISTS seo_errors (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        error_type VARCHAR(50),
        error_code INTEGER,
        error_message TEXT,
        priority VARCHAR(20),
        first_detected TIMESTAMP DEFAULT NOW(),
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP
      )
    `;

    // 6. Sitemap durumu
    await sql`
      CREATE TABLE IF NOT EXISTS seo_sitemaps (
        id SERIAL PRIMARY KEY,
        sitemap_url TEXT UNIQUE NOT NULL,
        type VARCHAR(50),
        submitted_date TIMESTAMP,
        last_downloaded TIMESTAMP,
        url_count INTEGER DEFAULT 0,
        indexed_count INTEGER DEFAULT 0,
        status VARCHAR(20),
        errors TEXT,
        warnings TEXT
      )
    `;

    // İndeksler oluştur
    await sql`CREATE INDEX IF NOT EXISTS idx_seo_performance_date ON seo_performance(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_seo_performance_query ON seo_performance(query)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_seo_pages_indexed ON seo_pages(indexed)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_seo_keywords_position ON seo_keywords(current_position)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_seo_errors_resolved ON seo_errors(resolved)`;

    // Tablo bilgilerini kontrol et
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'seo_%'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      message: 'SEO tables created successfully',
      tables: tables.map(t => t.table_name),
      features: {
        performance: 'Track search performance metrics',
        pages: 'Monitor page indexing and Core Web Vitals',
        keywords: 'Track keyword rankings',
        backlinks: 'Monitor backlink profile',
        errors: 'Track and fix SEO errors',
        sitemaps: 'Manage XML sitemaps'
      }
    });

  } catch (error) {
    console.error('Error creating SEO tables:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create SEO tables'
    }, { status: 500 });
  }
}