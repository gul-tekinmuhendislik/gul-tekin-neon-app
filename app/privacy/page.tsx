import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Gül-Tekin Mühendislik',
  description: 'Gül-Tekin Mühendislik gizlilik politikası ve kişisel verilerin korunması hakkında bilgiler.',
  robots: 'index, follow',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Ana Sayfa
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900">Gizlilik Politikası</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-gray-600">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Genel Bilgiler</h2>
            <p className="text-gray-700 mb-4">
              Gül-Tekin Mühendislik olarak, ziyaretçilerimizin ve müşterilerimizin gizliliğine önem veriyoruz.
              Bu gizlilik politikası, kişisel bilgilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında
              sizi bilgilendirmek amacıyla hazırlanmıştır.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Toplanan Bilgiler</h2>
            <p className="text-gray-700 mb-4">Web sitemizi ziyaret ettiğinizde aşağıdaki bilgiler toplanabilir:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>İletişim formları aracılığıyla verdiğiniz ad, e-posta, telefon ve mesaj içeriği</li>
              <li>IP adresi, tarayıcı türü, işletim sistemi gibi teknik bilgiler</li>
              <li>Site kullanım istatistikleri ve sayfa görüntüleme verileri</li>
              <li>Çerez (cookie) verileri</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="text-gray-700 mb-4">Toplanan bilgiler aşağıdaki amaçlarla kullanılır:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Teklif ve hizmet taleplerinize yanıt vermek</li>
              <li>Müşteri hizmetleri sağlamak ve destek sunmak</li>
              <li>Web sitesi performansını iyileştirmek</li>
              <li>İletişim kurmak ve bilgilendirme yapmak</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Bilgi Güvenliği</h2>
            <p className="text-gray-700 mb-4">
              Kişisel bilgilerinizin güvenliği bizim için önceliklidir. Bilgilerinizi yetkisiz erişim,
              kayıp veya kötüye kullanıma karşı korumak için uygun teknik ve organizasyonel önlemler alıyoruz.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Üçüncü Taraflarla Paylaşım</h2>
            <p className="text-gray-700 mb-4">
              Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.
              Hizmet sağlayıcılarımız (hosting, analytics vb.) ile paylaşılan bilgiler gizlilik
              sözleşmeleri ile korunur.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Çerezler (Cookies)</h2>
            <p className="text-gray-700 mb-4">
              Web sitemiz, kullanıcı deneyimini iyileştirmek ve site performansını analiz etmek için
              çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilir veya reddedebilirsiniz.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Haklarınız</h2>
            <p className="text-gray-700 mb-4">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Kişisel verilerinizin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. İletişim</h2>
            <p className="text-gray-700 mb-4">
              Gizlilik politikamız hakkında sorularınız veya talepleriniz için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>E-posta:</strong> info@gul-tekinmuhendislik.com</p>
              <p className="text-gray-700 mb-2"><strong>Telefon:</strong> 0252 386 35 54</p>
              <p className="text-gray-700"><strong>Adres:</strong> Gökçebel Mah. İnönü Cad. 61/D Yalıkavak/Muğla</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Politika Güncellemeleri</h2>
            <p className="text-gray-700">
              Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler olduğunda
              web sitemiz üzerinden bilgilendirme yapılacaktır. Politikayı düzenli olarak kontrol
              etmenizi öneririz.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
