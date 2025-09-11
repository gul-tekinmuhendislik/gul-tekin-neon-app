import Image from "next/image";
import { Star } from "lucide-react";

export default function ReviewQRCode() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <Star className="w-6 h-6 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Bizi Değerlendirin
        </h3>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        Google&apos;da deneyiminizi paylaşarak diğer müşterilere yardımcı olun
      </p>
      <div className="flex justify-center mb-4">
        <Image
          src="/qr-review.png"
          alt="Google Business Review QR Code"
          width={150}
          height={150}
          className="border border-gray-100 rounded-lg"
        />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        QR kodu okutarak kolayca değerlendirme yapabilirsiniz
      </p>
      <a
        href="https://g.page/r/Cd6nGRPdggFxEBE/review"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Star className="w-4 h-4 mr-2" />
        Değerlendirme Yap
      </a>
    </div>
  );
}