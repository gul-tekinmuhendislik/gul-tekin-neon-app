import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProjeler, type Proje } from '@/lib/static-data';
import ProjelerList from './projeler-list';
import ProjelerLive from './projeler-live';

export const metadata: Metadata = {
  title: 'Projeler - Gül-Tekin Mühendislik',
  description: 'Gül-Tekin Mühendislik olarak tamamladığımız ve devam eden projelerimiz. Muğla bölgesinde 500+ başarılı proje.',
  openGraph: {
    title: 'Projeler - Gül-Tekin Mühendislik',
    description: 'Gül-Tekin Mühendislik olarak tamamladığımız ve devam eden projelerimiz. Muğla bölgesinde 500+ başarılı proje.',
    type: 'website',
  },
};

export default function ProjelerPage() {
  const allProjeler = getAllProjeler().filter((proje: Proje) => proje.aktif !== false);

  // The first page is pre-rendered as static HTML; the live wrapper then applies ?page=.
  return (
    <Suspense fallback={<ProjelerList allProjeler={allProjeler} currentPage={1} />}>
      <ProjelerLive allProjeler={allProjeler} />
    </Suspense>
  );
}
