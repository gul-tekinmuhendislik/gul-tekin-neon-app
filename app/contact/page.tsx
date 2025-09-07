import { Metadata } from "next";
import ContactForm from "../components/ContactForm";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          İletişim
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Bizimle iletişime geçmek için aşağıdaki formu doldurun. En kısa sürede size dönüş yapacağız.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}