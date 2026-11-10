import ProjectPortfolioClient from './ProjectPortfolioClient';
import { getAllProjeler } from '@/lib/static-data';

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

function getRandomProjects(): Proje[] {
  try {
    const allProjects = getAllProjeler()
      .filter((p) => p.aktif !== false && p.cloudinary_url && p.aciklama);

    // Fisher-Yates shuffle
    const shuffled = [...allProjects];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 3).map((project) => ({
      id: project.id,
      proje_adi: project.proje_adi,
      slug: project.slug,
      aciklama: project.aciklama,
      mahalle: project.mahalle,
      ilce: project.ilce,
      baslangic_tarihi: project.baslangic_tarihi,
      bitis_tarihi: project.bitis_tarihi,
      ana_faaliyet_konusu: project.ana_faaliyet_konusu,
      cloudinary_url: project.cloudinary_url,
      sira: project.sira,
    }));
  } catch (error) {
    console.error('Error fetching random projects:', error);
    return [];
  }
}

export default async function ProjectPortfolioServer() {
  const projects = getRandomProjects();
  return <ProjectPortfolioClient initialProjects={projects} />;
}
