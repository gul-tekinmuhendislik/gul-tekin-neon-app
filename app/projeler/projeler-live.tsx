'use client';

import { useSearchParams } from 'next/navigation';
import type { Proje } from '@/lib/static-data';
import ProjelerList from './projeler-list';

interface ProjelerLiveProps {
  allProjeler: Proje[];
}

// Reads ?page= in the browser. Static export cannot read search params at build time.
export default function ProjelerLive({ allProjeler }: ProjelerLiveProps) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  return <ProjelerList allProjeler={allProjeler} currentPage={currentPage} />;
}
