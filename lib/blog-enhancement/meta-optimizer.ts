/**
 * Meta Description Optimizer
 * Meta description'ları 150-160 karakter arasında optimize eder
 */

export interface MetaOptimizationResult {
  original: string;
  optimized: string;
  length: number;
  improved: boolean;
  score: number; // 0-100
}

const IDEAL_MIN = 150;
const IDEAL_MAX = 160;
const ABSOLUTE_MAX = 165;

export const topicKeywords: Record<string, string[]> = {
  "Isı Pompası Sistemleri": [
    "ısı pompası",
    "bodrum ısı pompası",
    "enerji tasarrufu",
    "ısıtma sistemi",
    "klima"
  ],
  "Su Arıtma Sistemleri": [
    "su arıtma",
    "bodrum su arıtma",
    "temiz su",
    "su filtreleme",
    "RO sistem"
  ],
  "Sulama Sistemleri": [
    "otomatik sulama",
    "damlama sulama",
    "bahçe sulama",
    "sulama sistemi",
    "bodrum sulama"
  ],
  "Su Depoları ve Hidrofor Sistemleri": [
    "su deposu",
    "hidrofor",
    "bodrum hidrofor",
    "su basıncı",
    "polyester depo"
  ],
  "Termosifonik Sistemler": [
    "güneş enerjisi",
    "termosifonik",
    "solar ısıtma",
    "sıcak su",
    "bodrum solar"
  ]
};

export const ctaPhrases = [
  "Hemen arayın",
  "Ücretsiz keşif",
  "☎ 0533 XXX",
  "24/7 servis",
  "3 yıl garanti",
  "%10 indirim",
  "Arayın",
  "İletişim"
];

export const benefitPhrases: Record<string, string[]> = {
  "Isı Pompası Sistemleri": [
    "%60 tasarruf",
    "enerji verimliliği",
    "düşük fatura",
    "çevre dostu"
  ],
  "Su Arıtma Sistemleri": [
    "sağlıklı su",
    "temiz su",
    "su kalitesi",
    "filtreli su"
  ],
  "Sulama Sistemleri": [
    "%50 su tasarrufu",
    "otomatik sulama",
    "akıllı sulama",
    "zaman tasarrufu"
  ],
  "Su Depoları ve Hidrofor Sistemleri": [
    "kesintisiz su",
    "yüksek basınç",
    "depolama",
    "güvenli su"
  ],
  "Termosifonik Sistemler": [
    "elektrik tasarrufu",
    "güneş enerjisi",
    "çevre dostu",
    "ücretsiz ısıtma"
  ]
};

/**
 * Meta description'ı optimize eder
 */
export function optimizeMetaDescription(
  current: string | undefined,
  topic: string,
  title?: string,
  keywords?: string[]
): MetaOptimizationResult {

  // Mevcut description yoksa veya çok kısa ise yeni oluştur
  if (!current || current.trim().length < 80) {
    const generated = generateMetaDescription(topic, title, keywords);
    return {
      original: current || '',
      optimized: generated,
      length: generated.length,
      improved: true,
      score: 90
    };
  }

  const cleaned = current.trim();

  // Zaten ideal uzunluktaysa ve kaliteli ise değiştirme
  if (cleaned.length >= IDEAL_MIN && cleaned.length <= IDEAL_MAX) {
    const score = calculateMetaScore(cleaned, topic, keywords);
    if (score >= 70) {
      return {
        original: current,
        optimized: current,
        length: cleaned.length,
        improved: false,
        score
      };
    }
  }

  // Optimize et
  let optimized = cleaned;

  // Çok uzunsa kısalt
  if (optimized.length > ABSOLUTE_MAX) {
    optimized = truncateIntelligently(optimized, IDEAL_MAX);
  }

  // Çok kısaysa genişlet
  if (optimized.length < IDEAL_MIN) {
    optimized = expandMetaDescription(optimized, topic, IDEAL_MIN);
  }

  // CTA ekle (yoksa)
  if (!hasCTA(optimized)) {
    optimized = addCTA(optimized, IDEAL_MAX);
  }

  // Focus keyword ekle (yoksa)
  const focusKeyword = getFocusKeyword(topic, keywords);
  if (focusKeyword && !optimized.toLowerCase().includes(focusKeyword.toLowerCase())) {
    optimized = addKeyword(optimized, focusKeyword, IDEAL_MAX);
  }

  const finalScore = calculateMetaScore(optimized, topic, keywords);

  return {
    original: current,
    optimized,
    length: optimized.length,
    improved: optimized !== current,
    score: finalScore
  };
}

/**
 * Yeni meta description oluşturur
 */
function generateMetaDescription(
  topic: string,
  title?: string,
  keywords?: string[]
): string {
  const focusKeyword = getFocusKeyword(topic, keywords);
  const benefits = benefitPhrases[topic] || ["profesyonel hizmet"];
  const cta = "Ücretsiz keşif ☎ 0533 XXX";

  // Template: [Keyword] [benefit]. Bodrum/Milas [details]. [CTA]
  const parts: string[] = [];

  // Bodrum + keyword
  parts.push(`Bodrum'da ${focusKeyword || topic.toLowerCase()}`);

  // Benefit
  if (benefits.length > 0) {
    parts.push(benefits[0]);
  }

  // Details
  parts.push("kurulumu ve fiyatları. 15 yıl deneyim, 3 yıl garanti.");

  // CTA
  parts.push(cta);

  let description = parts.join(' ');

  // Ideal uzunluğa getir
  if (description.length > IDEAL_MAX) {
    description = truncateIntelligently(description, IDEAL_MAX);
  } else if (description.length < IDEAL_MIN) {
    // Ekstra detay ekle
    const extra = " Profesyonel kurulum, 24/7 servis.";
    if ((description + extra).length <= IDEAL_MAX) {
      description += extra;
    }
  }

  return description;
}

/**
 * Meta description'ı akıllıca kısaltır
 */
function truncateIntelligently(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Cümle sonunda kes
  const truncated = text.substring(0, maxLength - 3);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSentence > maxLength - 30) {
    return text.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace) + '...';
  } else {
    return truncated + '...';
  }
}

/**
 * Meta description'ı genişletir
 */
function expandMetaDescription(text: string, topic: string, targetLength: number): string {
  const benefits = benefitPhrases[topic] || [];
  const additions = [
    " Bodrum ve Milas'ta hizmet.",
    " 15 yıl deneyim, 3 yıl garanti.",
    " Profesyonel kurulum.",
    " 24/7 acil servis.",
    " Ücretsiz keşif."
  ];

  let expanded = text;

  for (const addition of additions) {
    if (expanded.length >= targetLength) break;
    if ((expanded + addition).length <= IDEAL_MAX) {
      expanded += addition;
    }
  }

  return expanded;
}

/**
 * CTA var mı kontrol eder
 */
function hasCTA(text: string): boolean {
  return ctaPhrases.some(phrase =>
    text.toLowerCase().includes(phrase.toLowerCase())
  );
}

/**
 * CTA ekler
 */
function addCTA(text: string, maxLength: number): string {
  const cta = " Hemen arayın ☎";
  if ((text + cta).length <= maxLength) {
    return text + cta;
  }
  // Yer yoksa sona ekleme
  return text;
}

/**
 * Focus keyword alır
 */
function getFocusKeyword(topic: string, keywords?: string[]): string {
  // Önce keywords dizisinden
  if (keywords && keywords.length > 0) {
    return keywords[0];
  }

  // Sonra topic-based
  const topicKws = topicKeywords[topic];
  if (topicKws && topicKws.length > 0) {
    return topicKws[0];
  }

  // Default
  return topic.toLowerCase();
}

/**
 * Keyword ekler
 */
function addKeyword(text: string, keyword: string, maxLength: number): string {
  // Başa ekle
  const withKeyword = `${keyword} - ${text}`;
  if (withKeyword.length <= maxLength) {
    return withKeyword;
  }

  // Yer yoksa orijinali döndür
  return text;
}

/**
 * Meta description kalite skoru hesaplar (0-100)
 */
export function calculateMetaScore(
  text: string,
  topic: string,
  keywords?: string[]
): number {
  let score = 0;

  // Uzunluk (40 puan)
  if (text.length >= IDEAL_MIN && text.length <= IDEAL_MAX) {
    score += 40;
  } else if (text.length >= 120 && text.length < IDEAL_MIN) {
    score += 30;
  } else if (text.length > IDEAL_MAX && text.length <= ABSOLUTE_MAX) {
    score += 30;
  } else {
    score += 10;
  }

  // Focus keyword (20 puan)
  const focusKeyword = getFocusKeyword(topic, keywords);
  if (focusKeyword && text.toLowerCase().includes(focusKeyword.toLowerCase())) {
    score += 20;
    // İlk 100 karakterde varsa +10
    if (text.substring(0, 100).toLowerCase().includes(focusKeyword.toLowerCase())) {
      score += 10;
    }
  }

  // CTA (15 puan)
  if (hasCTA(text)) {
    score += 15;
  }

  // Lokasyon belirtme (10 puan)
  if (text.toLowerCase().includes('bodrum') || text.toLowerCase().includes('milas')) {
    score += 10;
  }

  // Değer önerisi (15 puan)
  const benefits = benefitPhrases[topic] || [];
  const hasBenefit = benefits.some(benefit =>
    text.toLowerCase().includes(benefit.toLowerCase())
  );
  if (hasBenefit) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Batch optimize - Tüm bloglar için
 */
export function batchOptimizeMeta(
  blogs: Array<{
    id: number;
    topic: string;
    title: string;
    meta_description: string;
    keywords?: string[];
  }>
): Array<{ id: number; optimized: string; score: number }> {
  return blogs.map(blog => {
    const result = optimizeMetaDescription(
      blog.meta_description,
      blog.topic,
      blog.title,
      blog.keywords
    );

    return {
      id: blog.id,
      optimized: result.optimized,
      score: result.score
    };
  });
}
