import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Gul Tekin App</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Ana Sayfa
            </Link>
            <Link href="/ai" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              AI Asistan
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              İletişim
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}