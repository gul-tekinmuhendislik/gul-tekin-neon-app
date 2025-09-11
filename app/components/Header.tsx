"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MenuItem {
  id: number;
  title: string;
  href: string;
  order_index: number;
  icon?: string;
  target?: string;
}

export default function Header() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch('/api/navigation');
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        } else {
          console.error('Failed to fetch menu items');
          // Fallback menu items
          setMenuItems([
            { id: 1, title: 'Ana Sayfa', href: '/', order_index: 1 },
            { id: 2, title: 'Blog', href: '/blog', order_index: 2 },
            { id: 3, title: 'İletişim', href: '/contact', order_index: 3 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback menu items
        setMenuItems([
          { id: 1, title: 'Ana Sayfa', href: '/', order_index: 1 },
          { id: 2, title: 'Blog', href: '/blog', order_index: 2 },
          { id: 3, title: 'İletişim', href: '/contact', order_index: 3 }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, []);

  return (
    <header className="w-full bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="Gül-Tekin Mühendislik - Bodrum Mekanik Tesisat ve Enerji Sistemleri" 
                width={150} 
                height={38} 
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            {loading ? (
              <div className="flex space-x-8">
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
              </div>
            ) : (
              menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.target || '_self'}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.title}
                </Link>
              ))
            )}
          </nav>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 p-2"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {loading ? (
                <div className="space-y-2 px-3 py-2">
                  <div className="h-4 w-full bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-4 w-full bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-4 w-full bg-gray-300 animate-pulse rounded"></div>
                </div>
              ) : (
                menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.target || '_self'}
                    className="block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}