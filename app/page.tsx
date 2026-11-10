import { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import { IntegrationsSection } from "@/components/ui/integrations-section";
import { LogoCloud } from "@/components/ui/logo-cloud";
import Testimonials from "@/components/Testimonials";
import DatabaseStats from "@/components/DatabaseStats";
import ServiceLocations from "@/components/ServiceLocations";
import HeatPumps from "@/components/HeatPumps";
import VarmeksProducts from "@/components/VarmeksProducts";
import VarmeksPromoSidebar from "@/components/VarmeksPromoSidebar";
import VarmeksWarrantyFeatures from "@/components/VarmeksWarrantyFeatures";
import HeatPumpTroubleshooter from "@/components/HeatPumpTroubleshooter";
import LGProducts from "@/components/LGProducts";
import AldeaProducts from "@/components/AldeaProducts";
import { getHomeMetricsFromSnapshot } from '@/lib/static-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ana Sayfa | Gül-Tekin Mühendislik - Varmeks Isı Pompası ve Enerji Sistemleri",
  description: "Muğla ve Bodrum bölgesinde 20+ yıllık deneyimle Varmeks ısı pompası, güneş enerjisi, su arıtma ve mekanik tesisat çözümleri. ISO 9001 sertifikalı, %98 müşteri memnuniyeti.",
  keywords: "Varmeks ısı pompası, mekanik tesisat, güneş enerjisi sistemleri, su arıtma, yerden ısıtma, VRF klima, Muğla, Bodrum, Milas, Yalıkavak",
  openGraph: {
    title: "Gül-Tekin Mühendislik - Varmeks Isı Pompası ve Enerji Sistemleri",
    description: "20+ yıl deneyim, 236+ tamamlanmış proje. Varmeks ısı pompası, güneş enerjisi sistemleri. 7/24 teknik destek.",
    images: [{
      url: "/images/hero/varmeks-hero-1.jpg",
      width: 1200,
      height: 630,
      alt: "Gül-Tekin Mühendislik - Varmeks Isı Pompaları"
    }]
  },
};

export default function Home() {
  const { projectCount, locationCount } = getHomeMetricsFromSnapshot();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Varmeks Hero Slider Section */}
      <HeroSlider projectCount={projectCount} locationCount={locationCount} />
      <LogoCloud />
      <VarmeksPromoSidebar />
      <VarmeksProducts />
      <AldeaProducts />
      <VarmeksWarrantyFeatures />
      <IntegrationsSection />
      <HeatPumps />
      <HeatPumpTroubleshooter />
      <DatabaseStats />
      <ServiceLocations />
      <LGProducts />
      <Testimonials />
    </div>
  );
}