"use client";

import { useState } from "react";
import { Calendar, MapPin, Wrench, TrendingUp, Check } from "lucide-react";

interface Project {
  id: number;
  title: string;
  location: string;
  category: string;
  completionDate: string;
  description: string;
  features: string[];
  results: {
    energySaving?: string;
    costReduction?: string;
    efficiency?: string;
  };
  images?: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "Yalıkavak Marina VRF Klima Sistemi Yenileme",
    location: "Yalıkavak Marina, Bodrum",
    category: "VRF Klima Sistemleri",
    completionDate: "2023-12",
    description: "5000 m² kapalı alana sahip marina kompleksinin tüm klima sisteminin VRF teknolojisi ile yenilenmesi projesi.",
    features: [
      "120 iç ünite kurulumu",
      "Merkezi kontrol sistemi",
      "Zon bazlı sıcaklık kontrolü",
      "Enerji izleme sistemi entegrasyonu"
    ],
    results: {
      energySaving: "%45 Enerji Tasarrufu",
      efficiency: "%30 Verimlilik Artışı",
      costReduction: "Yıllık 850.000₺ Tasarruf"
    }
  },
  {
    id: 2,
    title: "Lüks Villa Isı Pompası ve Yerden Isıtma",
    location: "Göltürkbükü, Bodrum",
    category: "Isı Pompası & Yerden Isıtma",
    completionDate: "2024-02",
    description: "450 m² villa için hava kaynaklı ısı pompası ve yerden ısıtma sistemi kurulumu. Havuz ısıtması dahil.",
    features: [
      "32 kW Alarko ısı pompası",
      "Tüm yaşam alanlarında yerden ısıtma",
      "Akıllı termostat sistemi",
      "Havuz ısıtma entegrasyonu"
    ],
    results: {
      energySaving: "%60 Isıtma Maliyeti Düşüşü",
      efficiency: "COP 4.2 Verimlilik",
      costReduction: "2 Yıl Geri Ödeme Süresi"
    }
  },
  {
    id: 3,
    title: "Otel Güneş Enerjisi Santrali",
    location: "Turgutreis, Bodrum",
    category: "Güneş Enerjisi Sistemleri",
    completionDate: "2023-08",
    description: "80 odalı butik otel için 250 kWp çatı üstü güneş enerjisi santrali kurulumu.",
    features: [
      "580 adet 450W panel",
      "5 adet 50kW inverter",
      "Uzaktan izleme sistemi",
      "Şebeke bağlantılı sistem"
    ],
    results: {
      energySaving: "Yıllık 380.000 kWh Üretim",
      costReduction: "%70 Elektrik Faturası Düşüşü",
      efficiency: "3.5 Yıl Geri Ödeme"
    }
  },
  {
    id: 4,
    title: "Endüstriyel Su Arıtma Sistemi",
    location: "Milas OSB",
    category: "Su Arıtma Sistemleri",
    completionDate: "2024-01",
    description: "Gıda üretim tesisi için 100 m³/gün kapasiteli ters osmoz su arıtma sistemi.",
    features: [
      "Ön arıtma üniteleri",
      "Ters osmoz sistemi",
      "UV dezenfeksiyon",
      "Otomatik backwash sistemi"
    ],
    results: {
      efficiency: "%99.5 Arıtma Verimi",
      costReduction: "%80 Su Maliyeti Düşüşü",
      energySaving: "ISO 22000 Uyumlu"
    }
  },
  {
    id: 5,
    title: "Rezidans Merkezi Sistem Dönüşümü",
    location: "Yalıkavak, Bodrum",
    category: "Mekanik Tesisat",
    completionDate: "2023-10",
    description: "24 daireli rezidans projesi için komple mekanik tesisat ve merkezi sistem kurulumu.",
    features: [
      "Merkezi ısı pompası sistemi",
      "Daire bazlı kalorimetre",
      "Yangın tesisatı",
      "Hidrofor ve su depolama"
    ],
    results: {
      energySaving: "%50 Ortak Alan Gideri Düşüşü",
      efficiency: "A+ Enerji Sınıfı",
      costReduction: "24/7 Uzaktan İzleme"
    }
  }
];

export default function ProjectPortfolio() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ["Tümü", ...Array.from(new Set(projects.map(p => p.category)))];
  
  const filteredProjects = selectedCategory === "Tümü" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

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

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
              onClick={() => setSelectedProject(project)}
            >
              {/* Project Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Wrench className="w-16 h-16 opacity-30" />
                </div>
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
                  {new Date(project.completionDate).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long"
                  })}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Results Preview */}
                <div className="flex flex-wrap gap-2">
                  {Object.values(project.results).slice(0, 2).map((result, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {result}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
                    {new Date(selectedProject.completionDate).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Wrench className="w-4 h-4 mr-1" />
                    {selectedProject.category}
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  {selectedProject.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Proje Özellikleri</h4>
                  <ul className="space-y-2">
                    {selectedProject.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Proje Sonuçları</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(selectedProject.results).map(([key, value]) => (
                      <div key={key} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
                        <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Kapat
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Benzer Proje İste
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}