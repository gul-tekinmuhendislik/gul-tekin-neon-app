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
      LIMIT 8
    `;
    
    return result.map(row => ({
      name: row.name || 'Partner',
      logo: row.logo || '/placeholder-logo.png'
    }));
  } catch (error) {
    console.error('Error fetching partners:', error);
    // Fallback veriler
    return [
      { name: "Aldea", logo: "/aldea.jpeg" },
      { name: "REHAU", logo: "/REHAU.png" },
      { name: "Solimpeks", logo: "/solimpeks.png" },
      { name: "Varmek", logo: "/varmek.png" },
      { name: "Wepomp", logo: "/wepomp.png" },
      { name: "Wilo", logo: "/wilo.png" },
      { name: "Yelkenci", logo: "/yelkenci.png" },
    ];
  }
}

export async function LogoCloud() {
  const partners = await getRandomPartners();

  return (
    <section
      id="partners"
      className="mx-auto max-w-7xl px-6 text-center md:px-8 py-16"
    >
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <h2 className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Çözüm Ortaklarımız
        </h2>
        <p className="mt-2 text-center text-base text-gray-500">
          Sektörün lider markalarıyla güvenilir çözümler sunuyoruz
        </p>
        <div className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16">
            {partners.map((partner) => (
              <li key={partner.name}>
                <div className="flex items-center justify-center h-24 w-56 relative transition-all duration-300 opacity-80 hover:opacity-100">
                  <Image
                    alt={`${partner.name} - Gül-Tekin Mühendislik çözüm ortağı`}
                    src={partner.logo}
                    className="h-full w-full object-contain"
                    width={224}
                    height={96}
                    priority
                    unoptimized={partner.logo.includes('cloudinary')}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}