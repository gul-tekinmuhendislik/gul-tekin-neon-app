"use client";

import Link from "next/link";
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
            { id: 2, title: 'AI Asistan', href: '/ai', order_index: 2 },
            { id: 3, title: 'İletişim', href: '/contact', order_index: 3 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback menu items
        setMenuItems([
          { id: 1, title: 'Ana Sayfa', href: '/', order_index: 1 },
          { id: 2, title: 'AI Asistan', href: '/ai', order_index: 2 },
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
            <h1 className="text-xl font-semibold text-gray-900">Gul Tekin App</h1>
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
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}