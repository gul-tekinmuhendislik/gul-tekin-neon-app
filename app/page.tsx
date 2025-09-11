import { Metadata } from "next";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import logoDark from "@/assets/logo-dark.svg";
import Link from "next/link";
import arrow from "@/assets/arrow.svg";
import discord from "@/assets/discord.svg";
import docs from "@/assets/docs.svg";
import { checkDbConnection } from "./db";
import { Vortex } from "@/components/ui/gul-tekin-hero";
import { IntegrationsSection } from "@/components/ui/integrations-section";
import { LogoCloud } from "@/components/ui/logo-cloud";
import Testimonials from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Ana Sayfa | Gül-Tekin Mühendislik - Bodrum Isı Pompası ve Enerji Sistemleri",
  description: "Bodrum Yalıkavak'ta 20+ yıllık deneyimle ısı pompası, güneş enerjisi, su arıtma ve mekanik tesisat hizmetleri. ISO 9001 sertifikalı, %98 müşteri memnuniyeti.",
  keywords: "Bodrum ısı pompası, Yalıkavak mekanik tesisat, güneş enerjisi sistemleri, su arıtma, yerden ısıtma, VRF klima, Alarko yetkili servis",
  openGraph: {
    title: "Gül-Tekin Mühendislik - Bodrum Mekanik Tesisat ve Enerji Sistemleri",
    description: "20+ yıl deneyim, 500+ tamamlanmış proje. Isı pompası, güneş enerjisi, su arıtma sistemleri. 7/24 teknik destek.",
    images: [{
      url: "/logo.png",
      width: 1200,
      height: 630,
      alt: "Gül-Tekin Mühendislik - Bodrum"
    }]
  },
};

const DATA = {
  title: "Gül-Tekin <span class='text-[#00E599]'>Mühendislik</span>",
  subtitle: "<span class='text-blue-600 font-semibold'>20+ Yıl Deneyim</span> • <span class='text-green-600 font-semibold'>500+ Proje</span> • <span class='text-purple-600 font-semibold'>ISO 9001 Sertifikalı</span>",
  description:
    "Bodrum/Yalıkavak'ta <strong>uzman mühendis kadrosu</strong> ile ısı pompaları, güneş enerjisi sistemleri, su arıtma, yerden ısıtma ve mekanik tesisat çözümleri. <strong>Alarko, Baymak, Demirdöküm yetkili servisi.</strong> Ortalama %45 enerji tasarrufu, 7/24 teknik destek.",
  button: {
    text: "Hizmetlerimiz",
    href: "/services",
  },
  link: {
    text: "İletişime Geç",
    href: "/contact",
  },
  emergencyBanner: {
    text: "🚨 7/24 Acil Servis",
    phone: "0532 317 78 59"
  },
  footerLinks: [
    {
      text: "Blog",
      href: "/blog",
      icon: docs,
    },
    {
      text: "Hakkımızda",
      href: "/about",
      icon: discord,
    },
  ],
};

export default async function Home() {
  const result = await checkDbConnection();
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Vortex
        backgroundColor="white"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-12 md:py-16 lg:py-20 w-full min-h-[60vh] md:min-h-[70vh]"
        baseHue={120}
        particleCount={150}
        enableWaves={true}
        waveColors={["#00E599", "#3b82f6", "#8b5cf6"]}
        waveOpacity={0.15}
        waveSpeed={0.001}
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
          <main className="flex flex-1 flex-col justify-center">
            <div className="mb-6 md:mb-7">
              <Image
                className="lg:h-7 lg:w-auto dark:hidden"
                src={logo}
                alt="Gül-Tekin Mühendislik logosu - Mekanik tesisat ve enerji sistemleri"
                width={88}
                height={24}
                priority
              />
              <Image
                className="hidden lg:h-7 lg:w-auto dark:block"
                src={logoDark}
                alt="Gül-Tekin Mühendislik logosu - Mekanik tesisat ve enerji sistemleri"
                width={88}
                height={24}
                priority
              />
            </div>
            <h1
              className="text-3xl font-semibold leading-none tracking-tighter text-gray-900 md:text-4xl md:leading-none lg:text-5xl lg:leading-none"
              dangerouslySetInnerHTML={{ __html: DATA.title }}
            />
            {DATA.subtitle && (
              <p
                className="mt-2 text-sm md:text-base text-gray-600"
                dangerouslySetInnerHTML={{ __html: DATA.subtitle }}
              />
            )}
            <p
              className="mt-3.5 max-w-lg text-base leading-snug tracking-tight text-gray-700 md:text-lg md:leading-snug lg:text-xl lg:leading-snug"
              dangerouslySetInnerHTML={{ __html: DATA.description }}
            />
            {DATA.emergencyBanner && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-2">
                <span className="text-red-700 font-semibold">{DATA.emergencyBanner.text}</span>
                <a href={`tel:${DATA.emergencyBanner.phone.replace(/\s/g, '')}`} className="text-red-600 font-bold hover:underline">
                  {DATA.emergencyBanner.phone}
                </a>
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-5 md:mt-9 lg:mt-10">
              <Link
                className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-all duration-200 hover:bg-[#00E5BF] hover:scale-105 lg:px-7 lg:py-3"
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
                  src={arrow}
                  alt="Bağlantıya git ok işareti"
                  width={16}
                  height={10}
                  priority
                />
              </Link>
            </div>
          </main>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 py-5 sm:gap-2 sm:gap-6 md:pb-12 md:pt-10">
            <ul className="flex items-center gap-4 sm:gap-6">
              {DATA.footerLinks.map((link) => (
                <Link
                  className="flex items-center gap-2 text-gray-600 transition-all duration-200 hover:text-gray-900"
                  key={link.text}
                  href={link.href}
                >
                  <Image
                    className=""
                    src={link.icon}
                    alt={`${link.text} sayfası ikonu`}
                    width={16}
                    height={16}
                    priority
                  />
                  <span className="text-sm tracking-tight">{link.text}</span>
                </Link>
              ))}
            </ul>
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                result === "Database connected"
                  ? "border-[#00E599]/20 bg-[#00E599]/10 text-[#00E599]"
                  : "border-red-500/20 bg-red-500/10 text-red-500"
              }`}
            >
              {result}
            </span>
          </footer>
        </div>
      </Vortex>
      <Testimonials />
      <IntegrationsSection />
      <LogoCloud />
    </div>
  );
}