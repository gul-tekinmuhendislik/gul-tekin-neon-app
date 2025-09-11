import { Metadata } from "next";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import logoDark from "@/assets/logo-dark.svg";
import Link from "next/link";
import arrow from "@/assets/arrow.svg";
import discord from "@/assets/discord.svg";
import docs from "@/assets/docs.svg";
import { checkDbConnection } from "./db";
import { Vortex } from "@/components/ui/vortex";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description: "Mekanik mühendislik uzmanlığı ve yapay zeka destekli çözümler. Next.js, Vercel ve Neon PostgreSQL ile modern web uygulamaları.",
  openGraph: {
    title: "Gul Tekin - Mekanik Mühendislik ve AI Çözümleri",
    description: "Modern web teknolojileri ve yapay zeka ile güçlendirilmiş çözümler",
  },
};

const DATA = {
  title: "Gül-Tekin <span class='text-[#00E599]'>Mühendislik</span>",
  description:
    "Isı pompaları, güneş enerjisi sistemleri, su arıtma, yerden ısıtma ve mekanik tesisat çözümleri. Bodrum/Yalıkavak'ta güvenilir mühendislik hizmetleri.",
  button: {
    text: "Hizmetlerimiz",
    href: "/services",
  },
  link: {
    text: "İletişime Geç",
    href: "/contact",
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
    <div className="flex min-h-screen flex-col bg-black">
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
        baseHue={120}
        particleCount={150}
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
          <main className="flex flex-1 flex-col justify-center">
            <div className="mb-6 md:mb-7">
              <Image
                className="lg:h-7 lg:w-auto dark:hidden"
                src={logo}
                alt="Neon logo"
                width={88}
                height={24}
                priority
              />
              <Image
                className="hidden lg:h-7 lg:w-auto dark:block"
                src={logoDark}
                alt="Neon logo"
                width={88}
                height={24}
                priority
              />
            </div>
            <h1
              className="text-3xl font-semibold leading-none tracking-tighter text-white md:text-4xl md:leading-none lg:text-5xl lg:leading-none"
              dangerouslySetInnerHTML={{ __html: DATA.title }}
            />
            <p
              className="mt-3.5 max-w-lg text-base leading-snug tracking-tight text-gray-300 md:text-lg md:leading-snug lg:text-xl lg:leading-snug"
              dangerouslySetInnerHTML={{ __html: DATA.description }}
            />
            <div className="mt-8 flex flex-wrap items-center gap-5 md:mt-9 lg:mt-10">
              <Link
                className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-all duration-200 hover:bg-[#00E5BF] hover:scale-105 lg:px-7 lg:py-3"
                href={DATA.button.href}
              >
                {DATA.button.text}
              </Link>
              <Link
                className="group flex items-center gap-2 leading-none tracking-tight text-white hover:text-[#00E599] transition-colors"
                href={DATA.link.href}
              >
                {DATA.link.text}
                <Image
                  className="transition-transform duration-200 group-hover:translate-x-1 invert"
                  src={arrow}
                  alt="arrow"
                  width={16}
                  height={10}
                  priority
                />
              </Link>
            </div>
          </main>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 py-5 sm:gap-2 sm:gap-6 md:pb-12 md:pt-10">
            <ul className="flex items-center gap-4 sm:gap-6">
              {DATA.footerLinks.map((link) => (
                <Link
                  className="flex items-center gap-2 text-gray-400 transition-all duration-200 hover:text-white"
                  key={link.text}
                  href={link.href}
                >
                  <Image
                    className="invert"
                    src={link.icon}
                    alt={link.text}
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
    </div>
  );
}