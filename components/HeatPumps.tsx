import React from "react";
import Link from "next/link";
import {
  TrendingDown,
  Leaf,
  SunSnow,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  PhoneCall
} from "lucide-react";

export default function HeatPumps() {
  const benefits = [
    {
      icon: TrendingDown,
      title: "%70 - %80 Tasarruf",
      highlight: "Yüksek COP Değeri",
      description: "Isı pompası, harcadığı her 1 kW elektrik enerjisine karşılık 4 ila 4.8 kW ısı enerjisi üreterek faturalarınızı minimize eder.",
      badgeColor: "bg-emerald-100 text-emerald-800",
      iconBg: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: Leaf,
      title: "Çevre Dostu & Sıfır Emisyon",
      highlight: "Yenilenebilir Enerji",
      description: "Fosil yakıt yakmaz, duman ve zehirli gaz salınımı yapmaz. Güneş enerjisi (GES) ile entegre edilerek sıfır karbonlu enerjiye ulaşır.",
      badgeColor: "bg-teal-100 text-teal-800",
      iconBg: "bg-teal-500/10 text-teal-600",
    },
    {
      icon: SunSnow,
      title: "4 Mevsim Tek Sistem",
      highlight: "Isıtma + Soğutma + Sıcak Su",
      description: "Kışın yerden ısıtma veya radyatör ile mekan ısıtması, yazın fancoiller ile soğutma ve 7/24 kesintisiz 75°C sıcak su temin eder.",
      badgeColor: "bg-blue-100 text-blue-800",
      iconBg: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Cpu,
      title: "DC Inverter & Akıllı Yönetim",
      highlight: "Ultra Sessiz Çalışma",
      description: "Değişken devirli inverter kompresör ihtiyaca göre gücünü otomatik ayarlar, aşırı enerji sarfiyatını engeller ve sessiz çalışır.",
      badgeColor: "bg-purple-100 text-purple-800",
      iconBg: "bg-purple-500/10 text-purple-600",
    },
  ];

  const comparisonRows = [
    {
      feature: "Yıllık İşletme Maliyeti",
      heatPump: "En Düşük (1'e 4.8 Enerji Verimi)",
      fossil: "Çok Yüksek (Sürekli Yakıt Alımı)",
      electric: "Çok Yüksek (1'e 1 Verim)",
    },
    {
      feature: "4 Mevsim Soğutma & Isıtma",
      heatPump: "Var (Tek Cihazda Entegre)",
      fossil: "Yok (Ayrı Klima Gerekir)",
      electric: "Yok (Ayrı Klima Gerekir)",
    },
    {
      feature: "Güneş Enerjisi (GES) Uyumu",
      heatPump: "Tam Uyumlu (Bedava Enerji)",
      fossil: "Uyumsuz",
      electric: "Kısmi (Yüksek Tüketim)",
    },
    {
      feature: "Güvenlik & Temizlik",
      heatPump: "Maksimum (Baca/Gaz/Koku Yok)",
      fossil: "Riskli (Gaz Sızıntısı & Koku)",
      electric: "Güvenli fakat pahalı",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs sm:text-sm font-semibold mb-4">
            <span>Enerji Verimliliği & Modern Mühendislik</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Neden <span className="text-emerald-600">Isı Pompası</span> Tercih Etmelisiniz?
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Geleneksel fosil yakıtlı kazanlara ve elektrikli ısıtıcılara göre %75'e varan enerji tasarrufu sağlayan, çevre dostu ve uzun ömürlü iklimlendirme teknolojisi.
          </p>
        </div>

        {/* 4 Feature Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3.5 rounded-xl ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                      {item.highlight}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>A+++ Enerji Sınıfı</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparative Advantage Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 mb-12 overflow-x-auto">
          <div className="text-center mb-6">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900">
              Isı Pompası ile Geleneksel Sistemlerin Karşılaştırması
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evinizin enerji verimliliğini artıran somut avantajlar
            </p>
          </div>

          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Kriter</th>
                <th className="py-3 px-4 text-emerald-700 bg-emerald-50/60 rounded-t-xl font-bold">Varmeks Isı Pompası</th>
                <th className="py-3 px-4 text-slate-600">LPG / Mazot Kazanları</th>
                <th className="py-3 px-4 text-slate-600">Klasik Elektrikli Isıtıcı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{row.feature}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/40">{row.heatPump}</td>
                  <td className="py-3.5 px-4 text-slate-500">{row.fossil}</td>
                  <td className="py-3.5 px-4 text-slate-500">{row.electric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Strip */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Villanız veya İşletmeniz İçin Isı Kaybı & Tasarruf Analizi İsteyin
            </h4>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-light">
              Gül-Tekin Mühendislik uzmanları mekanınızı incelesin, en uygun kapasiteli sistemi projelendirsin.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-full transition-all duration-200 shadow-md text-sm whitespace-nowrap"
            >
              <span>Ücretsiz Keşif Al</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
