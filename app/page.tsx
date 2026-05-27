import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IntegrationsSection } from "@/components/ui/integrations-section";
import { LogoCloud } from "@/components/ui/logo-cloud";
import Testimonials from "@/components/Testimonials";
import DatabaseStats from "@/components/DatabaseStats";
import ServiceLocations from "@/components/ServiceLocations";
import HeatPumps from "@/components/HeatPumps";
import VarmeksProducts from "@/components/VarmeksProducts";
import LGProducts from "@/components/LGProducts";
import { getRandomBrands } from "@/lib/get-brands";
import { FlipWords } from "@/components/ui/flip-words";
import { sql } from '@/lib/db';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ana Sayfa | Gül-Tekin Mühendislik - Isı Pompası ve Enerji Sistemleri",
  description: "Muğla bölgesinde 20+ yıllık deneyimle ısı pompası, güneş enerjisi, su arıtma ve mekanik tesisat hizmetleri. ISO 9001 sertifikalı, %98 müşteri memnuniyeti.",
  keywords: "ısı pompası, mekanik tesisat, güneş enerjisi sistemleri, su arıtma, yerden ısıtma, VRF klima, Alarko yetkili servis, Muğla, Bodrum, Milas, Yalıkavak",
  openGraph: {
    title: "Gül-Tekin Mühendislik - Mekanik Tesisat ve Enerji Sistemleri",
    description: "20+ yıl deneyim, 500+ tamamlanmış proje. Isı pompası, güneş enerjisi, su arıtma sistemleri. 7/24 teknik destek.",
    images: [{
      url: "/logo.png",
      width: 1200,
      height: 630,
      alt: "Gül-Tekin Mühendislik"
    }]
  },
};

const DATA = {
  title: "Gül-Tekin Mühendislik",
  description:
    "Muğla bölgesinde uzman mühendis kadrosu ile ısı pompaları, güneş enerjisi, su arıtma ve mekanik tesisat çözümleri.",
  button: {
    text: "Hizmetlerimiz",
    href: "/services",
  },
  link: {
    text: "İletişime Geç",
    href: "/contact",
  },
  footerLinks: [],
};

async function getProjectCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM projeler_gul_tekin WHERE aktif = true
    `;
    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error('Error fetching project count:', error);
    return 500; // fallback
  }
}

async function getLocationCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM hizmet_lokasyonlari WHERE aktif = true
    `;
    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error('Error fetching location count:', error);
    return 4; // fallback
  }
}

export default async function Home() {
  const brandNames = await getRandomBrands(3);
  const projectCount = await getProjectCount();
  const locationCount = await getLocationCount();
  const subtitle = `${projectCount}+ Proje • ${locationCount} Lokasyon • 7/24 Destek`;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero — Asymmetric Split, viewport-stable */}
      <section className="relative min-h-[100dvh] grid md:grid-cols-2">
        {/* Background — subtle gradient, no particle effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white md:col-span-1" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,229,153,0.06),transparent_60%)]" />

        {/* Text content — left-aligned */}
        <div className="relative z-10 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 md:py-0">
          <div className="mb-6">
            <Image
              className="h-8 w-auto dark:hidden"
              src="/assets/logo.svg"
              alt="Gül-Tekin Mühendislik"
              width={150}
              height={40}
              priority
            />
            <Image
              className="hidden h-8 w-auto dark:block"
              src="/assets/logo-dark.svg"
              alt="Gül-Tekin Mühendislik"
              width={150}
              height={40}
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900 leading-[1.1]">
            {DATA.title}
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-600 max-w-md">
            {subtitle}
          </p>
          <p className="mt-4 text-base md:text-lg text-gray-700 max-w-lg leading-relaxed">
            {DATA.description}{" "}
            <FlipWords words={brandNames.length > 0 ? brandNames : ["Daikin", "Vaillant", "Bosch"]} duration={3000} className="text-[#00E599] font-semibold" />
            {" "}yetkili servisi.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-all duration-200 hover:bg-[#00E5BF] active:scale-[0.98] lg:px-7 lg:py-3"
              href={DATA.button.href}
            >
              {DATA.button.text}
            </Link>
            <Link
              className="group flex items-center gap-2 leading-none tracking-tight text-gray-900 hover:text-[#00E599] transition-colors"
              href={DATA.link.href}
            >
              {DATA.link.text}
              <Image
                className="transition-transform duration-200 group-hover:translate-x-1"
                src="/assets/arrow.svg"
                alt=""
                width={16}
                height={10}
                priority
              />
            </Link>
          </div>
        </div>
      </section>
      <LogoCloud />
      <VarmeksProducts />
      <LGProducts />
      <HeatPumps />
      <DatabaseStats />
      <ServiceLocations />
      <IntegrationsSection />
      <Testimonials />
    </div>
  );
}