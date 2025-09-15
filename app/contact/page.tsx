import { Metadata } from "next";
import ContactForm from "../components/ContactForm";
import { FeatureSection } from "@/components/ui/feature-section";
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LocalBusinessSchema />
      <FeatureSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
              İletişim
            </h1>
            <p className="text-gray-600 mb-8">
              Bizimle iletişime geçmek için aşağıdaki formu doldurun. En kısa sürede size dönüş yapacağız.
            </p>
            <ContactForm />
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bizi Ziyaret Edin</h2>
              <GoogleMyBusiness />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Konum</h3>
              <GoogleMap height="300px" className="shadow-lg" />
            </div>
            <ReviewQRCode />
          </div>
        </div>
      </div>
    </div>
  );
}