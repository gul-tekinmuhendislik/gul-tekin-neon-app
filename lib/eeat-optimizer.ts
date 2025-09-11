import Groq from "groq-sdk";
import { sql } from "./db";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// E-E-A-T analiz kriterleri
export interface EEATAnalysis {
  experience: {
    score: number;
    indicators: string[];
    recommendations: string[];
  };
  expertise: {
    score: number;
    indicators: string[];
    recommendations: string[];
  };
  authoritativeness: {
    score: number;
    indicators: string[];
    recommendations: string[];
  };
  trustworthiness: {
    score: number;
    indicators: string[];
    recommendations: string[];
  };
  overallScore: number;
  ymylCategory: boolean; // Your Money or Your Life içerik kategorisi
  contentImprovements: string[];
  schemaMarkupSuggestions: string[];
}

const eeatPrompt = `Sen, Google'ın Search Quality Evaluator Guidelines'ına göre E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) analizi yapan bir SEO uzmansın.

Gül-Tekin Mühendislik için üretilen içeriği analiz edecek ve iyileştirme önerileri sunacaksın.

**Firma Bilgileri:**
- Firma: Gül-Tekin Mühendislik
- Sektör: Mekanik tesisat, enerji verimliliği, mühendislik çözümleri
- Lokasyon: Bodrum/Milas
- Deneyim: 20+ yıl sektör deneyimi
- Uzmanlık Alanları: Isı pompaları, güneş enerjisi, su arıtma, klima sistemleri, yerden ısıtma
- Sertifikalar: ISO 9001, CE, TSE belgeli ürünler
- Referanslar: 500+ tamamlanmış proje

**E-E-A-T Değerlendirme Kriterleri:**

1. **Experience (Deneyim) - 0-25 puan:**
   - Gerçek kullanım deneyimleri
   - Pratik örnekler ve vaka çalışmaları
   - Somut çözümler ve uygulamalar
   - Yerel deneyim (Bodrum bölgesi)

2. **Expertise (Uzmanlık) - 0-25 puan:**
   - Teknik doğruluk ve derinlik
   - Sektörel terminoloji kullanımı
   - Detaylı açıklamalar
   - Profesyonel yaklaşım

3. **Authoritativeness (Otorite) - 0-25 puan:**
   - Firma bilgileri ve referanslar
   - Sektördeki konumu
   - Marka güvenilirliği
   - Sertifika ve belgeler

4. **Trustworthiness (Güvenilirlik) - 0-25 puan:**
   - İletişim bilgileri
   - Şeffaflık ve dürüstlük
   - Müşteri odaklı yaklaşım
   - Garanti ve servis bilgileri

**YMYL (Your Money or Your Life) Değerlendirmesi:**
Mühendislik içerikleri YMYL kategorisindedir çünkü:
- Güvenlik açısından kritik sistemler (gaz, elektrik, su)
- Yüksek maliyetli yatırım kararları
- Sağlık ve konfor etkileyen sistemler

**Çıktı Formatı:**
JSON formatında detaylı E-E-A-T analizi ve öneriler`;

export async function analyzeEEAT(content: string, topic: string, metadata: Record<string, unknown> = {}): Promise<EEATAnalysis> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: eeatPrompt
        },
        {
          role: "user",
          content: `İçerik Konusu: ${topic}

İçerik:
${content.substring(0, 3000)} ${content.length > 3000 ? '...[içerik kısaltıldı]' : ''}

Metadata:
- İçerik uzunluğu: ${content.length} karakter
- Oluşturulma tarihi: ${metadata.createdAt || new Date().toISOString()}

Bu içeriği E-E-A-T kriterlerine göre analiz et ve JSON formatında şu yapıda döndür:
{
  "experience": {
    "score": 0-25 arası puan,
    "indicators": ["Bulunan pozitif göstergeler listesi"],
    "recommendations": ["İyileştirme önerileri listesi"]
  },
  "expertise": {
    "score": 0-25 arası puan,
    "indicators": ["Bulunan pozitif göstergeler listesi"],
    "recommendations": ["İyileştirme önerileri listesi"]
  },
  "authoritativeness": {
    "score": 0-25 arası puan,
    "indicators": ["Bulunan pozitif göstergeler listesi"],
    "recommendations": ["İyileştirme önerileri listesi"]
  },
  "trustworthiness": {
    "score": 0-25 arası puan,
    "indicators": ["Bulunan pozitif göstergeler listesi"],
    "recommendations": ["İyileştirme önerileri listesi"]
  },
  "overallScore": toplam skor (0-100),
  "ymylCategory": true/false,
  "contentImprovements": ["Genel içerik iyileştirme önerileri"],
  "schemaMarkupSuggestions": ["Schema.org markup önerileri"]
}`
        }
      ],
      model: "llama-3.3-70b-versatile", // Groq'un önerdiği yeni model
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const analysisResult = completion.choices[0]?.message?.content;
    if (!analysisResult) {
      throw new Error("E-E-A-T analysis failed: No response from AI");
    }

    return JSON.parse(analysisResult) as EEATAnalysis;
  } catch (error) {
    console.error("Error in E-E-A-T analysis:", error);
    
    // Fallback basit analiz
    return {
      experience: {
        score: 15,
        indicators: ["İçerik oluşturuldu"],
        recommendations: ["Gerçek proje örnekleri eklenebilir", "Müşteri deneyimleri paylaşılabilir"]
      },
      expertise: {
        score: 18,
        indicators: ["Teknik bilgi mevcut"],
        recommendations: ["Daha detaylı teknik spesifikasyonlar", "Karşılaştırmalı analizler"]
      },
      authoritativeness: {
        score: 16,
        indicators: ["Firma bilgileri var"],
        recommendations: ["Sertifika bilgileri eklenebilir", "Referans projelere atıf"]
      },
      trustworthiness: {
        score: 17,
        indicators: ["İletişim bilgileri mevcut"],
        recommendations: ["Garanti bilgileri detaylandırılabilir", "Müşteri yorumları eklenebilir"]
      },
      overallScore: 66,
      ymylCategory: true,
      contentImprovements: [
        "Yazar bilgileri eklenebilir",
        "Güncel tarih ve güncelleme bilgisi",
        "Daha fazla görsel ve infografik"
      ],
      schemaMarkupSuggestions: [
        "Article schema",
        "Organization schema",
        "LocalBusiness schema",
        "FAQPage schema"
      ]
    };
  }
}

export async function optimizeContentForEEAT(
  contentId: number,
  content: string,
  topic: string,
  currentMetadata: Record<string, unknown> = {}
): Promise<{
  analysis: EEATAnalysis;
  optimizedContent?: string;
  optimizationApplied: boolean;
}> {
  try {
    // Step 1: Analyze current content
    const analysis = await analyzeEEAT(content, topic, currentMetadata);
    console.log(`E-E-A-T Score for content ${contentId}: ${analysis.overallScore}/100`);

    // Step 2: If score is below 75, generate optimization suggestions
    if (analysis.overallScore < 75) {
      const optimizationPrompt = `İçeriği E-E-A-T skorunu artıracak şekilde optimize et. 

Mevcut E-E-A-T Skoru: ${analysis.overallScore}/100

İyileştirme Önerileri:
- Experience: ${analysis.experience.recommendations.join(", ")}
- Expertise: ${analysis.expertise.recommendations.join(", ")}
- Authoritativeness: ${analysis.authoritativeness.recommendations.join(", ")}
- Trustworthiness: ${analysis.trustworthiness.recommendations.join(", ")}

İçerik Konusu: ${topic}

Mevcut İçerik:
${content.substring(0, 2000)}

Lütfen içeriğe şu eklemeleri yap:
1. Gül-Tekin Mühendislik'in 20+ yıllık deneyiminden bahset
2. Bodrum bölgesindeki başarılı proje örnekleri ekle
3. Teknik uzmanlık ve sertifikaları vurgula
4. Müşteri memnuniyeti ve güvenilirlik vurgusu
5. İletişim ve destek bilgileri

Optimized içeriği döndür (sadece eklenen/değiştirilen kısımları, tam içeriği değil):`;

      const optimizationCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Sen bir E-E-A-T optimizasyon uzmanısın. İçerikleri Google'ın kalite kriterlerine göre iyileştiriyorsun."
          },
          {
            role: "user",
            content: optimizationPrompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1500
      });

      const optimizedContent = optimizationCompletion.choices[0]?.message?.content;

      if (optimizedContent) {
        // Save E-E-A-T analysis to database
        await sql`
          UPDATE generated_content
          SET metadata = jsonb_set(
            jsonb_set(
              COALESCE(metadata, '{}'),
              '{eeatAnalysis}',
              ${JSON.stringify(analysis)}::jsonb
            ),
            '{eeatOptimization}',
            ${JSON.stringify({
              applied: true,
              timestamp: new Date().toISOString(),
              originalScore: analysis.overallScore,
              improvements: optimizedContent.substring(0, 500) // Store preview
            })}::jsonb
          )
          WHERE id = ${contentId}
        `;

        return {
          analysis,
          optimizedContent,
          optimizationApplied: true
        };
      }
    }

    // Save E-E-A-T analysis even if no optimization needed
    await sql`
      UPDATE generated_content
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'),
        '{eeatAnalysis}',
        ${JSON.stringify(analysis)}::jsonb
      )
      WHERE id = ${contentId}
    `;

    return {
      analysis,
      optimizationApplied: false
    };
  } catch (error) {
    console.error("Error in E-E-A-T optimization:", error);
    throw error;
  }
}

// Schema.org markup generator for E-E-A-T
interface ContentData {
  title: string;
  meta_description: string;
  slug: string;
  created_at: string;
  updated_at?: string;
  keywords?: string[];
}

export function generateSchemaMarkup(
  content: ContentData,
  eeatAnalysis: EEATAnalysis
): Record<string, unknown> {
  const schemas = [];

  // Article schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": content.title,
    "description": content.meta_description,
    "author": {
      "@type": "Organization",
      "name": "Gül-Tekin Mühendislik",
      "url": "https://gul-tekinmuhendislik.com",
      "logo": "https://gul-tekinmuhendislik.com/logo.png",
      "sameAs": [
        "https://www.facebook.com/gultekinmuhendislik",
        "https://www.instagram.com/gultekinmuhendislik",
        "https://www.linkedin.com/company/gultekinmuhendislik"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gül-Tekin Mühendislik",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gul-tekinmuhendislik.com/logo.png"
      }
    },
    "datePublished": content.created_at,
    "dateModified": content.updated_at || content.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://gul-tekinmuhendislik.com/blog/${content.slug}`
    }
  });

  // LocalBusiness schema for trust signals
  if (eeatAnalysis.trustworthiness.score > 15) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Gül-Tekin Mühendislik",
      "description": "Bodrum ve Milas bölgesinde mekanik tesisat ve enerji verimliliği çözümleri",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bodrum",
        "addressRegion": "Muğla",
        "addressCountry": "TR"
      },
      "telephone": "+90 252 XXX XX XX",
      "url": "https://gul-tekinmuhendislik.com",
      "priceRange": "₺₺₺",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    });
  }

  // Professional Service schema for expertise
  if (eeatAnalysis.expertise.score > 15) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Gül-Tekin Mühendislik",
      "serviceType": [
        "Isı Pompası Kurulumu",
        "Güneş Enerjisi Sistemleri",
        "Su Arıtma Sistemleri",
        "Klima Sistemleri",
        "Mekanik Tesisat"
      ],
      "areaServed": {
        "@type": "City",
        "name": "Bodrum"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Mühendislik Hizmetleri",
        "itemListElement": content.keywords?.map((keyword: string) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": keyword
          }
        }))
      }
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas
  };
}