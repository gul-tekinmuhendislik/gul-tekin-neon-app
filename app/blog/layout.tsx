import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Mekanik mühendislik, ısı pompaları, güneş enerjisi sistemleri ve yerden ısıtma hakkında güncel bilgiler ve teknik yazılar.',
  keywords: 'mekanik mühendislik blog, ısı pompası yazıları, güneş enerjisi makaleleri, yerden ısıtma sistemleri, Muğla mühendislik',
  openGraph: {
    title: 'Blog | Gül-Tekin Mühendislik',
    description: 'Mekanik mühendislik ve yenilenebilir enerji sistemleri hakkında teknik yazılar ve güncel bilgiler.',
    type: 'website',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}