import ProjectStatistics from './ProjectStatistics';
import { getAllProjeler, getAllMarkalar } from '@/lib/static-data';

async function getProjectCount() {
  try {
    return getAllProjeler().filter((p) => p.aktif !== false).length;
  } catch (error) {
    console.error('Error fetching project count:', error);
    return 500;
  }
}

async function getBrandCount() {
  try {
    return getAllMarkalar().filter((m) => m.aktif !== false).length;
  } catch (error) {
    console.error('Error fetching brand count:', error);
    return 98;
  }
}

export default async function ProjectStatisticsServer() {
  const [projectCount, brandCount] = await Promise.all([
    getProjectCount(),
    getBrandCount(),
  ]);

  return <ProjectStatistics projectCount={projectCount} brandCount={brandCount} />;
}
