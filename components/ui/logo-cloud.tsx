import Image from "next/image";
import { sql } from '@/lib/db';

interface Partner {
  name: string;
  logo: string;
}

async function getRandomPartners(): Promise<Partner[]> {
  try {
    const result = await sql`
      SELECT 
        marka_adi as name,
        COALESCE(cloudinary_url, logo_url) as logo
      FROM markalar
      WHERE aktif = true 
        AND (cloudinary_url IS NOT NULL OR logo_url IS NOT NULL)
      ORDER BY RANDOM()
      LIMIT 12
    `;
    
    return result.map(row => ({
      name: row.name || 'Partner',
      logo: row.logo || '/placeholder-logo.png'
    }));
  } catch (error) {
    console.error('Error fetching partners:', error);
    // Fallback veriler
    return [
      { name: "Varmek", logo: "/varmek.png" },
      { name: "REHAU", logo: "/REHAU.png" },
      { name: "Solimpeks", logo: "/solimpeks.png" },
      { name: "Wilo", logo: "/wilo.png" },
      { name: "Wepomp", logo: "/wepomp.png" },
      { name: "Yelkenci", logo: "/yelkenci.png" },
      { name: "Aldea", logo: "/aldea.jpeg" },
    ];
  }
}

export async function LogoCloud() {
  const partners = await getRandomPartners();

  return (
    <section
      id="partners"
      className="py-8 sm:py-10 bg-slate-50/50 border-b border-slate-200/60"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
            Çözüm Ortaklarımız & Yetkili Markalar
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-light">
            Sektörün lider markalarıyla güvenilir ve garantili mühendislik çözümleri
          </p>
        </div>

        {/* Compact Responsive 6-Column Grid on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 items-center justify-center">
          {partners.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="flex items-center justify-center h-14 sm:h-16 px-4 py-2 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="relative w-full h-full">
                <Image
                  alt={`${partner.name} - Gül-Tekin Mühendislik`}
                  src={partner.logo}
                  className="h-full w-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  unoptimized={partner.logo.includes('cloudinary')}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}