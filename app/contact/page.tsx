import { Metadata } from "next";
import ContactForm from "../components/ContactForm";
import { ArrowUpRight, MapPin } from "lucide-react";
import GoogleMyBusiness from "@/components/GoogleMyBusiness";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import ReviewQRCode from "../components/ReviewQRCode";
import GoogleMap from "@/components/GoogleMap";
import { CONTACT_INFO } from "@/lib/contact-info";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "İletişim",
  description: "Bodrum ve Yalıkavak'taki mekanik tesisat, ısı pompası ve enerji projeleriniz için Gül-Tekin Mühendislik ile iletişime geçin.",
  openGraph: {
    title: "İletişim | Gul Tekin",
    description: "Bodrum ve Yalıkavak'taki projeleriniz için Gül-Tekin Mühendislik ile iletişime geçin.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f3f6f4]">
      <LocalBusinessSchema />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-3 text-sm font-semibold uppercase text-emerald-800">
            Gül-Tekin Mühendislik <span className="px-2 text-gray-400">/</span> Yalıkavak, Bodrum
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-gray-950 sm:text-4xl">
            Projenizi birlikte konuşalım.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
            İhtiyacınızı anlatın; size en uygun mekanik tesisat ve enerji çözümü için ekibimizle iletişime geçin.
          </p>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-7">
          <GoogleMyBusiness />

          <section aria-labelledby="contact-form-title" className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <p className="mb-2 text-sm font-semibold uppercase text-emerald-800">İletişim formu</p>
              <h2 id="contact-form-title" className="text-2xl font-semibold text-gray-950">
                Size nasıl yardımcı olabiliriz?
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Formu gönderin, ekibimiz en kısa sürede sizinle iletişime geçsin.
              </p>
            </div>
            <ContactForm />
          </section>
        </div>

        <section aria-labelledby="location-title" className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.5fr_0.7fr] lg:gap-7">
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase text-emerald-800">
                  <MapPin className="h-4 w-4" /> Bodrum, Muğla
                </p>
                <h2 id="location-title" className="text-2xl font-semibold text-gray-950">
                  Ofisimizi ziyaret edin
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Gökçebel Mah. İnönü Cad. 61/D, Yalıkavak, Bodrum, Muğla 48990
                </p>
              </div>
              <a
                href={CONTACT_INFO.googleMaps.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:border-emerald-700 hover:text-emerald-800 sm:self-auto"
              >
                Yol tarifi al <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <GoogleMap height="340px" className="shadow-none" />
          </div>

          <div className="min-w-0">
            <ReviewQRCode />
          </div>
        </section>
      </div>
    </div>
  );
}