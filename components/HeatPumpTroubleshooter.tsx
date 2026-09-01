"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ZapOff,
  ThermometerSnowflake,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  TrendingDown,
  Cpu,
  Flame
} from "lucide-react";
import { whatsappHref, phoneHref } from "@/lib/contact-info";

export default function HeatPumpTroubleshooter() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const problems = [
    {
      id: "fatura",
      badge: "Maliyet & Verimsizlik",
      title: "Isı Pompanız Çok mu Elektrik Faturası Getiriyor?",
      problemSummary: "Beklediğinizden 2-3 kat yüksek gelen elektrik faturaları ve sürekli çalışan kompresör.",
      rootCauses: [
        "Binanın ısı kaybına göre yanlış kapasite (küçük veya gereğinden aşırı büyük kW) seçimi.",
        "Tampon Tank (Buffer Tank) ve Denge Kabı olmaması sebebiyle cihazın sürekli dur-kalk (short cycling) yapması.",
        "On/Off eski tip kompresörlerin aşırı pik akımı çekmesi veya yanlış su sıcaklık parametreleri (yüksek eğri ayarı).",
        "İzolasyon yetersizliği ve hidrolik debi dengesizliği sebebiyle rezistansın (yardımcı ısıtıcının) sürekli devrede kalması.",
      ],
      solutionTitle: "Gül-Tekin Mühendislik Çözümü:",
      solutionPoints: [
        "Lazerli termal kamera ve hassas m² ısı kaybı hesabı ile net güç tespiti.",
        "Sisteme uygun hacimde Tampon Tank entegre edilerek kompresör açma-kapama sıklığının %70 azaltılması.",
        "Doğru hava-su kompanzasyon eğrisi ayarlanarak gereksiz elektrik tüketiminin önlenmesi.",
        "A+++ EVI DC Inverter sistem revizyonu ile faturalarda %40'a varan anında tasarruf.",
      ],
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      iconBg: "bg-red-500/10 text-red-600",
      stat: "%40'a Varan Fatura Düşüşü",
      accentColor: "emerald"
    },
    {
      id: "isinamama",
      badge: "Konfor & Performans Kaybı",
      title: "Ev Yeterince Isınmıyor mu? (Isınamıyor musunuz?)",
      problemSummary: "Hava soğuduğunda peteklerin ılık kalması, yerden ısıtmanın geç tepki vermesi veya odalar arası sıcaklık farkı.",
      rootCauses: [
        "Standart ısı pompalarının 0°C ve -5°C altında %40'a varan kapasite kaybına uğraması ve donma korumasına geçmesi.",
        "Yerden ısıtma kollektörlerinde hidrolik balans ayarının yapılmamış olması (yakın odalar sıcak, uzak odalar soğuk).",
        "Tesisat boru çaplarının dar olması sebebiyle gereken debinin (m³/h) devirdaim yapılamaması.",
        "Filtre ve eşanjörlerde tortu/kireç birikmesi sonucu ısı transferinin engellenmesi.",
      ],
      solutionTitle: "Gül-Tekin Mühendislik Çözümü:",
      solutionPoints: [
        "-30°C dondurucu soğukta dahi 75°C sıcak su üretebilen EVI Enjeksiyonlu Varmeks/LG Monoblok teknolojisi.",
        "Lazerli debimetre ile her oda için ayrı hidrolik balans ve reglaj ayarı yapılması.",
        "Doğru sirkülasyon pompası seçimi ile tesisattaki basınç kayıplarının sıfırlanması.",
        "Eşanjör ve sistem kimyasal temizliği ile ilk günkü ısı iletkenliğine geri dönüş.",
      ],
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      iconBg: "bg-amber-500/10 text-amber-600",
      stat: "75°C Kesintisiz Sıcak Su",
      accentColor: "blue"
    },
    {
      id: "ariza",
      badge: "Güvenilirlik & Arıza",
      title: "Sistem Sürekli Arızaya mı Geçiyor veya Gürültülü mü?",
      problemSummary: "Hata kodları (E01, Defrost Hatası, Akış Hatası), aşırı gürültülü dış ünite veya su sızıntıları.",
      rootCauses: [
        "Akış anahtarı (Flow Switch) arızaları ve tesisattaki hava sebebiyle cihazın kendini korumaya alması.",
        "Manyetik pislik tutucu olmaması nedeniyle plaka eşanjörün tıkanması ve delinme riski.",
        "Dış ünitenin titreşim takozları olmadan monte edilmesi ve rezonans gürültüsü üretmesi.",
        "Bölgede yetkili ve ehil olmayan ustalar tarafından yapılan hatalı elektrik ve hidrolik bağlantılar.",
      ],
      solutionTitle: "Gül-Tekin Mühendislik Çözümü:",
      solutionPoints: [
        "Manyetik tortu tutucu, otomatik hava tahliye ve glikollü donma koruma kitleri ile tam koruma.",
        "Titreşim sönümleyici yaylı kauçuk takoz montajı ile sessiz (gece modu) çalışma garantisi.",
        "Bodrum ve tüm Muğla'da 7/24 mobil yetkili teknik servis & orijinal yedek parça desteği.",
        "Varmeks modellerinde 5 yıl kompresör ve 3 yıl tam cihaz garantisi ile güvence.",
      ],
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      iconBg: "bg-blue-500/10 text-blue-600",
      stat: "5 Yıl Yetkili Servis Garantisi",
      accentColor: "purple"
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Isı Pompası Sorun & Çözüm Merkezi</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Isı Pompanızdan <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">Şikayetçi misiniz?</span>
          </h2>
          
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 font-light leading-relaxed">
            Yüksek elektrik faturası, ısınamama veya sık arıza sorunları <strong>ısı pompasının değil, yanlış projelendirmenin ve eksik hidrolik altyapının</strong> sonucudur. Gül-Tekin Mühendislik olarak tüm bu sorunları kesin olarak çözüyoruz.
          </p>
        </div>

        {/* Problem Selector Tabs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10 max-w-4xl mx-auto">
          {problems.map((prob, idx) => (
            <button
              key={prob.id}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === idx
                  ? "bg-white/10 border-emerald-400/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/30 text-white"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${activeTab === idx ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"}`}>
                  0{idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-semibold">
                  {idx === 0 ? "Yüksek Fatura" : idx === 1 ? "Isınamama Sorunu" : "Sık Arıza & Gürültü"}
                </span>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${activeTab === idx ? "text-emerald-400 translate-x-1" : "text-slate-600"}`} />
            </button>
          ))}
        </div>

        {/* Active Problem vs Solution Detailed View */}
        {(() => {
          const item = problems[activeTab];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
              
              {/* Left Column: Problem & Root Causes */}
              <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-red-500/20 p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      <ZapOff className="w-3.5 h-3.5" />
                      {item.badge}
                    </span>
                    <span className="text-xs text-slate-500">Mevcut Durum</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-red-200/80 mb-6 bg-red-950/40 p-3.5 rounded-xl border border-red-900/40 font-light">
                    ⚠️ {item.problemSummary}
                  </p>

                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                    Bu Sorunun Gerçek Nedenleri:
                  </h4>

                  <ul className="space-y-3">
                    {item.rootCauses.map((cause, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                        <span className="text-red-400 font-bold mt-0.5">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Hatalı Projelendirme</span>
                  <span className="text-red-400 font-medium">Verim Kaybı: ~%50</span>
                </div>
              </div>

              {/* Right Column: Gül-Tekin Engineering Solution */}
              <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl relative">
                
                <div className="absolute top-4 right-4 hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mühendislik Garantisi</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Kesin Çözüm Metodumuz</span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{item.solutionTitle}</h3>
                    </div>
                  </div>

                  <div className="mb-6 bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-emerald-200">Gül-Tekin Müdahalesi Sonucu:</span>
                    <span className="text-xs sm:text-sm font-bold px-3 py-1 bg-emerald-500 text-slate-950 rounded-full shadow-sm">
                      {item.stat}
                    </span>
                  </div>

                  <div className="space-y-3.5 mb-6">
                    {item.solutionPoints.map((point, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Consultation Strip */}
                <div className="pt-6 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-300 font-medium">Mevcut sisteminizi inceleyelim, eksikleri tespit edelim:</p>
                    <span className="text-xs text-emerald-400 font-semibold">Bodrum & Muğla genelinde ücretsiz yerinde keşif</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <a
                      href={whatsappHref("0532 317 78 59")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp ile Danış</span>
                    </a>
                    
                    <a
                      href={phoneHref("0532 317 78 59")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all border border-white/15"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hemen Ara</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* Global Bottom Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-800 via-slate-850 to-slate-800 border border-slate-700/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Isı Pompası Revizyon, Kapasite Analizi ve Periyodik Bakım
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-light">
                Markası ne olursa olsun (Varmeks, LG, Daikin, Viessmann, Bosch, Alarko), uzman mühendis kadromuzla sisteminizi maksimum verime ulaştırıyoruz.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="w-full md:w-auto whitespace-nowrap inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 hover:bg-emerald-400 font-bold rounded-full text-xs sm:text-sm transition-all duration-200 shadow-md"
          >
            <span>Revizyon & Keşif Formu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
