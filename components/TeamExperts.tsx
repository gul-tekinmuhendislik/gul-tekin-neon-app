"use client";

import { Award, BookOpen } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  expertise: string[];
  experience: string;
  certifications: string[];
  image?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Yusuf Gültekin",
    title: "Kurucu",
    expertise: ["Isı Pompaları", "Enerji Verimliliği", "Mekanik Tesisat"],
    experience: "20+ yıl",
    certifications: ["Makine Mühendisi", "Enerji Yöneticisi Sertifikası"]
  }
];

const companyCredentials = [
  { icon: Award, title: "CE Belgeli Ürünler", desc: "Avrupa Uygunluk Sertifikası" },
  { icon: BookOpen, title: "TSE Hizmet Yeri Yeterlilik", desc: "Türk Standartları Enstitüsü Onaylı" }
];

export default function TeamExperts() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Uzman Kadromuz
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Alanında uzman mühendislerimiz ve teknisyenlerimizle, Bodrum bölgesinde 
            güvenilir ve kaliteli hizmet sunuyoruz. Sürekli eğitim ve sertifikasyon 
            programlarıyla kendimizi geliştiriyoruz.
          </p>
        </div>

        {/* Team Grid */}
        <div className="flex justify-center mb-16">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {member.name}
              </h3>
              <p className="text-blue-600 text-center text-sm font-medium mb-3">
                {member.title}
              </p>
              
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Uzmanlık Alanları</p>
                <div className="flex flex-wrap gap-1">
                  {member.expertise.map((exp, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Deneyim</p>
                <p className="text-sm font-semibold text-gray-700">{member.experience} Sektör Deneyimi</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sertifikalar</p>
                <ul className="space-y-1">
                  {member.certifications.map((cert, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="text-green-500 mr-1">✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Company Credentials */}
        <div className="border-t pt-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Kurumsal Yeterliliklerimiz
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyCredentials.map((credential, index) => {
              const Icon = credential.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200">
                  <Icon className="w-12 h-12 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">{credential.title}</h4>
                  <p className="text-sm text-gray-600">{credential.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}