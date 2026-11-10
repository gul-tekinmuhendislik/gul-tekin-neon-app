import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Sohbet Asistanı",
  description: "Gül-Tekin Mühendislik AI asistanı - Groq API ve Llama 3.3 70B modeli ile güçlendirilmiş.",
  openGraph: {
    title: "AI Sohbet Asistanı | Gul Tekin",
    description: "Groq API ve Llama 3.3 70B modeli ile güçlendirilmiş AI asistanı.",
  },
  keywords: ["AI asistan", "Groq API", "Llama 3.3", "yapay zeka sohbet", "chatbot"],
};

export default function AIPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI Sohbet Asistanı
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gül-Tekin Mühendislik AI asistanımız, sorularınıza yanıt verir ve size yardımcı olur.
          Bu özellik GitHub Pages static deployment için devre dışı bırakılmıştır.
        </p>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Bu sayfa AI sohbet arayüzünü göstermektedir.</p>
        <p>Model: Llama 3.3 70B Versatile (Groq API)</p>
        <p className="mt-2 text-yellow-600">⚠️ Canlı sohbet özelliği statik site üzerinde devre dışıdır.</p>
      </div>
    </div>
  );
}