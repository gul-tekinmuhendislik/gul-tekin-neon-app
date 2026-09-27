import { Metadata } from "next";
import ContactForm from "../components/ContactForm";
import GoogleMyBusiness from "@/components/GoogleMyBusiness";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import ReviewQRCode from "../components/ReviewQRCode";
import GoogleMap from "@/components/GoogleMap";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "İletişim",
  description: "Mekanik mühendislik ve AI çözümleri için bizimle iletişime geçin. Projeleriniz için profesyonel destek alın.",
  openGraph: {
    title: "İletişim | Gul Tekin",
    description: "Mekanik mühendislik ve AI çözümleri için bizimle iletişime geçin.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <LocalBusinessSchema />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              İletişim
            </h1>
            <p className="text-gray-600 mb-6">
              Bizimle iletişime geçmek için aşağıdaki formu doldurun. En kısa sürede size dönüş yapacağız.
            </p>
            <ContactForm />
          </div>
          <div className="space-y-6">
            <GoogleMyBusiness />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
              <GoogleMap height="300px" className="shadow-lg" />
            </div>
            <ReviewQRCode />
          </div>
        </div>
      </div>
    </div>
  );
}