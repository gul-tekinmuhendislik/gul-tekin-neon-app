"use client";

import { useState } from "react";
import { Calendar, MapPin, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  location: string;
  category: string;
  completionDate: string;
  description: string;
  slug: string;
  image: string | null;
}

interface ProjectPortfolioClientProps {
  initialProjects: Project[];
}

export default function ProjectPortfolioClient({ initialProjects }: ProjectPortfolioClientProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tamamlanan Projelerimiz
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Bodrum ve Milas bölgesinde gerçekleştirdiğimiz 500&apos;den fazla başarılı projeden örnekler.
            Her projede enerji verimliliği ve müşteri memnuniyetini ön planda tutuyoruz.
          </p>
        </div>

        {/* Projects Grid */}
        {initialProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setSelectedProject(project)}
              >
                {/* Project Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Wrench className="w-16 h-16 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    {project.completionDate ? new Date(project.completionDate).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long"
                    }) : 'Devam Ediyor'}
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/projeler/${project.slug}`}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Projeler yükleniyor...</p>
          </div>
        )}

        {/* View All Projects Button */}
        <div className="text-center mt-12">
          <Link
            href="/projeler"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tüm Projelerimizi Görüntüle
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Project Statistics */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold text-center mb-8">
            Proje İstatistiklerimiz
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-blue-100">Tamamlanan Proje</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">15M+</p>
              <p className="text-blue-100">kWh Enerji Tasarrufu</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">%98</p>
              <p className="text-blue-100">Müşteri Memnuniyeti</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-blue-100">Teknik Destek</p>
            </div>
          </div>
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedProject.title}
                </h3>

                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedProject.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {selectedProject.completionDate ? new Date(selectedProject.completionDate).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    }) : 'Devam Ediyor'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Wrench className="w-4 h-4 mr-1" />
                    {selectedProject.category}
                  </div>
                </div>

                {selectedProject.image && (
                  <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                <p className="text-gray-700 mb-6">
                  {selectedProject.description}
                </p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Kapat
                  </button>
                  <Link
                    href={`/projeler/${selectedProject.slug}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Proje Detayları
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}