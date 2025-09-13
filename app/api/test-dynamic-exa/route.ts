import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import Exa from "exa-js";

export async function GET() {
  try {
    // Step 1: Get random brands, services, and products
    const brands = await sql`
      SELECT marka_adi
      FROM markalar
      WHERE marka_adi IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 5
    `;

    const services = await sql`
      SELECT hizmet_adi, kategori
      FROM hizmetler
      WHERE hizmet_adi IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 5
    `;

    const products = await sql`
      SELECT urun_adi, kategori
      FROM urunler
      WHERE urun_adi IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 3
    `;

    // Step 2: Generate search queries
    const queries: string[] = [];

    if (brands.length > 0 && services.length > 0) {
      // Pick random combinations
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];

      // Create different query types
      queries.push(`${randomBrand.marka_adi} ${randomService.hizmet_adi} kurulum montaj fiyat`);
      queries.push(`${services[0].hizmet_adi} teknoloji yenilikler 2024 trendler`);

      if (services[0].kategori) {
        queries.push(`${services[0].kategori} sistemleri Bodrum Muğla uygulama örnekleri`);
      }

      if (products.length > 0) {
        queries.push(`${products[0].urun_adi} özellikleri karşılaştırma inceleme`);
      }
    }

    // Step 3: Perform a test search with the first query
    let searchResult = null;
    if (queries.length > 0 && process.env.EXA_API_KEY) {
      const exa = new Exa(process.env.EXA_API_KEY);

      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await exa.searchAndContents(queries[0], {
          type: "auto",
          numResults: 3,
          startPublishedDate: thirtyDaysAgo.toISOString().split('T')[0],
          text: {
            maxCharacters: 500,
            includeHtmlTags: false
          }
        });

        searchResult = {
          query: queries[0],
          resultsCount: result.results?.length || 0,
          results: result.results?.map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.text?.substring(0, 200)
          }))
        };
      } catch (error) {
        console.error("Exa search error:", error);
        searchResult = {
          query: queries[0],
          error: "Search failed"
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        brands: brands.map(b => b.marka_adi),
        services: services.map(s => ({
          name: s.hizmet_adi,
          category: s.kategori
        })),
        products: products.map(p => ({
          name: p.urun_adi,
          category: p.kategori
        })),
        generatedQueries: queries,
        testSearch: searchResult
      }
    });

  } catch (error) {
    console.error("Error in dynamic Exa test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test dynamic Exa search",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}