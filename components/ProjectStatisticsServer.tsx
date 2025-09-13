import { sql } from '@/lib/db';
import ProjectStatistics from './ProjectStatistics';

async function getProjectCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM projeler_gul_tekin
      WHERE aktif = true
    `;
    return parseInt(result[0]?.count || '500');
  } catch (error) {
    console.error('Error fetching project count:', error);
    return 500;
  }
}

async function getBrandCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM markalar
      WHERE aktif = true
    `;
    return parseInt(result[0]?.count || '98');
  } catch (error) {
    console.error('Error fetching brand count:', error);
    return 98;
  }
}

export default async function ProjectStatisticsServer() {
  const [projectCount, brandCount] = await Promise.all([
    getProjectCount(),
    getBrandCount()
  ]);

  return <ProjectStatistics projectCount={projectCount} brandCount={brandCount} />;
}