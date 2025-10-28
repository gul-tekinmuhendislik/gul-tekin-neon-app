import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kullanım Şartları | Gül-Tekin Mühendislik',
  description: 'Gül-Tekin Mühendislik web sitesi kullanım şartları ve koşulları.',
  robots: 'index, follow',
};

export default function TermsPage() {
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
                <span className="text-gray-900">Kullanım Şartları</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kullanım Şartları
          </h1>
          <p className="text-gray-600">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Genel Hükümler</h2>
            <p className="text-gray-700 mb-4">
              Bu web sitesi Gül-Tekin Mühendislik tarafından işletilmektedir. Siteyi kullanarak,
              aşağıda belirtilen kullanım şartlarını kabul etmiş sayılırsınız. Bu şartları kabul
              etmiyorsanız, lütfen siteyi kullanmayınız.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hizmet Kapsamı</h2>
            <p className="text-gray-700 mb-4">Gül-Tekin Mühendislik olarak sunduğumuz hizmetler:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Mekanik tesisat sistemleri kurulumu ve bakımı</li>
              <li>Isı pompası sistemleri satış, kurulum ve servis</li>
              <li>Güneş enerjisi sistemleri</li>
              <li>Su arıtma sistemleri</li>
              <li>Hidrofor ve pompa sistemleri</li>
              <li>Yerden ısıtma sistemleri</li>
              <li>Klima sistemleri</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Site Kullanımı</h2>
            <p className="text-gray-700 mb-4">Web sitemizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Site içeriğini yalnızca yasal amaçlar için kullanabilirsiniz</li>
              <li>Site güvenliğini tehlikeye atacak eylemlerden kaçınmalısınız</li>
              <li>Telif haklarına ve fikri mülkiyet haklarına saygı göstermelisiniz</li>
              <li>Spam veya zararlı içerik gönderemezsiniz</li>
              <li>Başkalarının kişisel bilgilerini izinsiz kullanamazsınız</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Fikri Mülkiyet Hakları</h2>
            <p className="text-gray-700 mb-4">
              Bu web sitesindeki tüm içerik, tasarım, logo, metin, görsel, yazılım ve diğer materyaller
              Gül-Tekin Mühendislik'in mülkiyetindedir ve telif hakkı yasaları ile korunmaktadır.
              İzinsiz kullanım, kopyalama, çoğaltma veya dağıtım yasaktır.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fiyatlar ve Ürün Bilgileri</h2>
            <p className="text-gray-700 mb-4">
              Web sitemizdeki ürün bilgileri ve görseller bilgilendirme amaçlıdır. Fiyatlar ve
              stok durumu değişiklik gösterebilir. Kesin fiyat ve teslimat bilgileri için bizimle
              iletişime geçmeniz gerekmektedir.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Teklif ve Sipariş Süreci</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Web sitesi üzerinden gönderilen talepler teklif talebi niteliğindedir</li>
              <li>Kesin sipariş, yazılı veya dijital onay ile oluşur</li>
              <li>Fiyat teklifleri belirtilen süre dahilinde geçerlidir</li>
              <li>Özel projeler için ayrı sözleşme düzenlenir</li>
              <li>Ödeme koşulları proje bazında belirlenir</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Garanti ve Sorumluluk</h2>
            <p className="text-gray-700 mb-4">
              Kurulumunu gerçekleştirdiğimiz sistemler için üretici garantisi ve işçilik garantisi
              sunulmaktadır. Garanti koşulları ve süreleri ürün ve hizmet bazında değişiklik gösterir.
            </p>
            <p className="text-gray-700 mb-4">Sorumluluklarımız:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Profesyonel ve standartlara uygun kurulum</li>
              <li>Kaliteli malzeme kullanımı</li>
              <li>Garanti kapsamındaki arızalarda servis desteği</li>
              <li>Müşteri memnuniyeti odaklı hizmet</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sorumluluk Sınırlamaları</h2>
            <p className="text-gray-700 mb-4">
              Gül-Tekin Mühendislik, web sitesinin kesintisiz ve hatasız çalışacağını garanti etmez.
              Site içeriğinde yer alan bilgilerin doğruluğu için çaba gösterilse de, dolaylı veya
              doğrudan oluşabilecek zararlardan sorumluluk kabul edilmez.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Üçüncü Taraf Bağlantıları</h2>
            <p className="text-gray-700 mb-4">
              Web sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir. Bu bağlantılar
              yalnızca kullanıcı kolaylığı için sağlanmıştır. Üçüncü taraf sitelerin içeriğinden
              veya politikalarından sorumlu değiliz.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Değişiklikler</h2>
            <p className="text-gray-700 mb-4">
              Gül-Tekin Mühendislik, bu kullanım şartlarını önceden haber vermeksizin değiştirme
              hakkını saklı tutar. Güncel şartları düzenli olarak kontrol etmeniz önerilir.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Uygulanacak Hukuk</h2>
            <p className="text-gray-700 mb-4">
              Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir. Ortaya çıkabilecek
              uyuşmazlıklarda Muğla mahkemeleri ve icra daireleri yetkilidir.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. İletişim</h2>
            <p className="text-gray-700 mb-4">
              Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Firma Adı:</strong> Gül-Tekin Mühendislik</p>
              <p className="text-gray-700 mb-2"><strong>E-posta:</strong> info@gul-tekinmuhendislik.com</p>
              <p className="text-gray-700 mb-2"><strong>Telefon:</strong> 0252 386 35 54</p>
              <p className="text-gray-700 mb-2"><strong>GSM:</strong> 0532 317 78 59</p>
              <p className="text-gray-700"><strong>Adres:</strong> Gökçebel Mah. İnönü Cad. 61/D Yalıkavak/Muğla</p>
            </div>
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
