import Link from "next/link";
import Image from "next/image";
import { withBasePath } from "@/lib/base-path";
import { prisma } from '@/lib/prisma';
import { Sparkles } from "@/components/ui/sparkles";
import ClientNavigation from "./ClientNavigation";

interface MenuItem {
  id: number;
  title: string;
  href: string;
  order_index: number;
  icon?: string;
  target?: string;
  children?: MenuItem[];
}

async function getNavigationMenu(): Promise<MenuItem[]> {
  try {
    // Get all parent menu items
    const parentItems = await prisma.navigation_menu.findMany({
      where: {
        is_active: true,
        parent_id: null
      },
      orderBy: {
        order_index: 'asc'
      }
    });

    // Get all submenu items
    const subItems = await prisma.navigation_menu.findMany({
      where: {
        is_active: true,
        parent_id: { not: null }
      },
      orderBy: [
        { parent_id: 'asc' },
        { order_index: 'asc' }
      ]
    });

    // Build hierarchical menu structure
    const menuItems = parentItems.map((parent) => {
      const children = subItems.filter((sub) => sub.parent_id === parent.id);
      return {
        ...parent,
        children: children.length > 0 ? children : undefined
      };
    });

    return menuItems as MenuItem[];
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    // Fallback menu items for SEO and accessibility
    return [
      { id: 1, title: 'Ana Sayfa', href: '/', order_index: 1 },
      { id: 2, title: 'Hizmetler', href: '/hizmetler', order_index: 2 },
      { id: 3, title: 'Ürünler', href: '/urunler', order_index: 3 },
      { id: 4, title: 'Projeler', href: '/projeler', order_index: 4 },
      { id: 5, title: 'Blog', href: '/blog', order_index: 5 },
      { id: 6, title: 'İletişim', href: '/contact', order_index: 6 }
    ];
  }
}

export default async function ServerHeader() {
  const menuItems = await getNavigationMenu();

  return (
    <header className="w-full bg-gray-100 border-b border-gray-200 relative z-[9999]">
      <Sparkles
        className="absolute inset-0 z-0"
        particleColor="#9CA3AF"
        particleDensity={60}
        minSize={0.3}
        maxSize={0.8}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image
                src={withBasePath("/logo.png")}
                alt="Gül-Tekin Mühendislik - Mekanik Tesisat ve Enerji Sistemleri"
                width={150}
                height={38}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Server-rendered navigation for SEO */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.children ? (
                  <div className="text-gray-700 hover:text-gray-900 px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer">
                    <span>{item.title}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    target={item.target || '_self'}
                    className="text-gray-700 hover:text-gray-900 px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    {item.title}
                  </Link>
                )}
                {item.children && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-xl rounded-md border border-gray-200 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10001]">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        target={child.target || '_self'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Client component for mobile navigation */}
          <ClientNavigation menuItems={menuItems} />
        </div>
      </div>
    </header>
  );
}