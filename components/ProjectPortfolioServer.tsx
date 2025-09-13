import { sql } from '@/lib/db';
import ProjectPortfolioClient from './ProjectPortfolioClient';

interface Proje {
  id: number;
  proje_adi: string;
  slug: string;
  aciklama: string;
  mahalle: string;
  ilce: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  ana_faaliyet_konusu: string[];
  cloudinary_url: string;
  sira: number;
}

async function getRandomProjects() {
  try {
    const projects = await sql<Proje[]>`
      SELECT
        id,
        proje_adi,
        slug,
        aciklama,
        mahalle,
        ilce,
        baslangic_tarihi,
        bitis_tarihi,
        ana_faaliyet_konusu,
        cloudinary_url,
        sira
      FROM projeler_gul_tekin
      WHERE aktif = true
        AND cloudinary_url IS NOT NULL
        AND aciklama IS NOT NULL
        AND aciklama != ''
      ORDER BY RANDOM()
      LIMIT 3
    `;

    return projects.map(project => ({
      id: project.id,
      title: project.proje_adi,
      location: `${project.mahalle || ''} ${project.ilce || 'Bodrum'}`.trim(),
      category: Array.isArray(project.ana_faaliyet_konusu)
        ? project.ana_faaliyet_konusu[0]
        : 'Mekanik Tesisat',
      completionDate: project.bitis_tarihi || project.baslangic_tarihi || '2024-01',
      description: project.aciklama || '',
      slug: project.slug,
      image: project.cloudinary_url || null
    }));
  } catch (error) {
    console.error('Error fetching random projects:', error);
    return [];
  }
}

export default async function ProjectPortfolioServer() {
  const projects = await getRandomProjects();
  return <ProjectPortfolioClient initialProjects={projects} />;
}