"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { List, X, CaretDown, House, Envelope } from "@phosphor-icons/react";

interface MenuItem {
  id: number;
  title: string;
  href: string;
  order_index: number;
  icon?: string;
  target?: string;
  children?: MenuItem[];
}

export default function Header() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

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
    <header className="w-full bg-gray-100 border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="Gül-Tekin Mühendislik" 
                width={120} 
                height={30} 
                className="h-7 w-auto"
                priority
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {loading ? (
              <div className="flex space-x-4 lg:space-x-6">
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
              </div>
            ) : (
              menuItems.map((item) => {
                const isHome = item.href === '/';
                const isContact = item.href === '/contact';
                return (
                  <div
                    key={item.id}
                    className="relative z-50 group"
                    onMouseEnter={() => item.children && setOpenSubmenu(item.id)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    {item.children ? (
                      <div className="text-gray-700 hover:text-gray-900 px-1.5 py-2 text-xs font-bold tracking-wide uppercase transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer">
                        <span>{item.title}</span>
                        <CaretDown className="w-3 h-3" weight="bold" />
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        target={item.target || '_self'}
                        className="text-gray-700 hover:text-gray-900 px-1.5 py-2 text-xs font-bold tracking-wide uppercase transition-colors whitespace-nowrap flex items-center gap-1"
                        title={isHome ? 'Ana Sayfa' : isContact ? 'İletişim' : item.title}
                      >
                        {isHome ? <House className="w-4 h-4" weight="bold" /> : isContact ? <Envelope className="w-4 h-4" weight="bold" /> : item.title}
                      </Link>
                    )}
                    {item.children && openSubmenu === item.id && (
                      <div className="absolute top-full left-0 -mt-1 pt-2 bg-white shadow-xl rounded-md border border-gray-200 pb-2 min-w-[200px] z-50">
                        <div className="pt-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              target={child.target || '_self'}
                              className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 uppercase tracking-wide transition-colors"
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
                <X className="h-6 w-6" weight="bold" />
              ) : (
                <List className="h-6 w-6" weight="bold" />
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
                menuItems.map((item) => {
                  const isHome = item.href === '/';
                  const isContact = item.href === '/contact';
                  return (
                    <div key={item.id}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                            className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm font-semibold transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              {isHome && <House className="w-4 h-4" weight="bold" />}
                              {isContact && <Envelope className="w-4 h-4" weight="bold" />}
                              {item.title}
                            </span>
                            <CaretDown
                              className={`w-4 h-4 transition-transform ${openSubmenu === item.id ? 'rotate-180' : ''}`}
                              weight="bold"
                            />
                          </button>
                          {openSubmenu === item.id && (
                            <div className="pl-6 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.href}
                                  target={child.target || '_self'}
                                  className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {child.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          target={item.target || '_self'}
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm font-semibold transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {isHome && <House className="w-4 h-4" weight="bold" />}
                          {isContact && <Envelope className="w-4 h-4" weight="bold" />}
                          {isHome ? 'Ana Sayfa' : isContact ? 'İletişim' : item.title}
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}