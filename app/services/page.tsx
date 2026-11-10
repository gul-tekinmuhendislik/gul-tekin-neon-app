import { redirect } from 'next/navigation';

export const revalidate = 3600;

export default function ServicesPage() {
  redirect('/hizmetler');
  return null;
}