export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Hakkımızda
            </h3>
            <p className="text-gray-600 text-sm">
              Modern ve kullanıcı dostu web uygulamaları geliştiriyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Bağlantılar
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Kullanım Şartları
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              İletişim
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Email: info@example.com</li>
              <li>Tel: +90 123 456 7890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Gul Tekin App. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}