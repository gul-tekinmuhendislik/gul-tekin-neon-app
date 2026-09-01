import { Metadata } from "next";
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
  Flame,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import FAQSchema from "@/components/FAQSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { whatsappHref, phoneHref } from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "Isı Pompası Çok mu Elektrik Yakıyor? Isınamıyor musunuz? | Gül-Tekin Mühendislik",
  description: "Isı pompasında yüksek elektrik faturası, peteklerin ısınmaması veya sık arıza şikayetlerinizin gerçek nedenleri ve Gül-Tekin Mühendislik kesin çözümleri. Bodrum & Muğla ücretsiz revizyon keşfi.",
  keywords: [
    "ısı pompası çok elektrik yakıyor",
    "ısı pompası faturası neden yüksek gelir",
    "ısı pompası evi ısıtmıyor",
    "ısı pompası petekler ısınmıyor",
    "ısı pompası tampon tank ne işe yarar",
    "ısı pompası arızaları ve çözümleri",
    "bodrum ısı pompası servisi",
    "muğla ısı pompası revizyon",
    "ısı pompası neden sık durur"
  ],
  alternates: {
    canonical: "https://gul-tekinmuhendislik.com/isi-pompasi-sorunlari-ve-cozumleri",
  },
  openGraph: {
    title: "Isı Pompası Sorunları ve Mühendislik Çözümleri | Gül-Tekin Mühendislik",
    description: "Yüksek fatura, yetersiz ısıtma ve sık arızaları doğru hidrolik projelendirme ve tampon tank entegrasyonu ile çözüyoruz.",
    url: "https://gul-tekinmuhendislik.com/isi-pompasi-sorunlari-ve-cozumleri",
    type: "article",
    locale: "tr_TR",
  },
};

export default function HeatPumpProblemsPage() {
  const faqItems = [
    {
      question: "Isı pompam beklediğimden çok elektrik faturası getiriyor, sebebi ne olabilir?",
      answer: "Yüksek faturanın en yaygın nedenleri: 1) Sisteme uygun hacimde Tampon Tank (Buffer Tank) takılmaması sonucu cihazın sürekli dur-kalk (short cycling) yaparak pik akımı çekmesi, 2) Isı kaybı hesabı yapılmadan yanlış kW seçilmesi, 3) Su gidiş sıcaklığı eğrisinin gereğinden yüksek ayarlanması ve yardımcı elektrikli rezistansın sürekli devrede kalmasıdır. Gül-Tekin Mühendislik olarak hidrolik revizyon ile faturalarınızı %40'a varan oranda düşürüyoruz."
    },
    {
      question: "Hava sıcaklığı 0°C veya altına düştüğünde ısı pompası neden evi ısıtamaz?",
      answer: "Standart ısı pompaları dış hava soğudukça gaz basıncı düşüşü sebebiyle %40'a varan kapasite kaybına uğrar. EVI (Enhanced Vapor Injection) teknolojisine sahip olmayan cihazlar donma korumasına (defrost) çok sık girer. Gül-Tekin Mühendislik -30°C'de dahi 75°C sıcak su üreten EVI DC Inverter Varmeks ve LG sistemleri ile kesintisiz konfor sağlar."
    },
    {
      question: "Yerden ısıtmalı evimde bazı odalar çok sıcakken bazı odalar neden soğuk kalıyor?",
      answer: "Bu durum debi dengesizliğinden (hidrolik balans eksikliği) kaynaklanır. Kollektör giriş-çıkışlarındaki debimetre reglaj ayarları yapılmadığında su en kısa yoldan geri döner ve uzak odalara yeterli sıcak su ulaşmaz. Mühendislik ekibimiz her zon için debi ve reglaj ayarlarını optimize eder."
    },
    {
      question: "Isı pompasına Tampon Tank (Buffer Tank) taktırmak şart mı?",
      answer: "Evet! Tampon tank, sistemdeki su hacmini artırarak kompresörün sık sık devreye girip çıkmasını önler, kompresör ömrünü en az 2 kat uzatır, defrost esnasında evdeki ısının çekilmesini engeller ve elektrik faturasını doğrudan düşürür."
    },
    {
      question: "Mevcut çalışan ısı pompam için Gül-Tekin Mühendislik'ten keşif ve revizyon alabilir miyim?",
      answer: "Evet. Markası ne olursa olsun (Varmeks, LG, Daikin, Viessmann, Bosch, Alarko vb.), Bodrum, Milas ve Muğla genelinde uzman mühendislerimiz adresinize gelerek sisteminizi inceler, verim kayıplarını tespit eder ve revizyon projesi sunar."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <BreadcrumbSchema
        items={[
          { name: "Ana Sayfa", url: "/" },
          { name: "Isı Pompası Sorunları ve Çözümleri", url: "/isi-pompasi-sorunlari-ve-cozumleri" }
        ]}
      />
      <FAQSchema items={faqItems} />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Mühendislik Teşhis & İyileştirme Rehberi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Isı Pompanız <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">Çok mu Elektrik Yakıyor?</span><br />
            Isınamıyor musunuz?
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            Isı pompaları doğru kurulduğunda dünyanın en ekonomik iklimlendirme sistemidir. Ancak <strong>eksik hidrolik altyapı, yanlış kapasite ve tampon tank eksikliği</strong> sistemi bir elektrik canavarına dönüştürebilir.
          </p>

          {/* Quick CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappHref("0532 317 78 59")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp ile Ücretsiz Teşhis Al</span>
            </a>

            <a
              href={phoneHref("0532 317 78 59")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-sm sm:text-base transition-all border border-white/15"
            >
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <span>Mühendisimize Danışın: 0532 317 78 59</span>
            </a>
          </div>

        </div>
      </section>

      {/* 3 Major Pain Points & Technical Solutions */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              En Sık Karşılaşılan 3 Isı Pompası Problemi ve Mühendislik Çözümlerimiz
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 font-light">
              Gül-Tekin Mühendislik olarak 20+ yıllık saha tecrübemizle arızanın kaynağını noktasal olarak tespit ediyoruz.
            </p>
          </div>

          <div className="space-y-12">
            
            {/* Problem 1: High Electricity Bills */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 mb-4">
                  <ZapOff className="w-3.5 h-3.5" />
                  <span>Problem 1</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Beklenenden 2-3 Kat Yüksek Gelen Elektrik Faturaları
                </h3>
                <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-4">
                  Normal şartlarda ısı pompasının 1 kW elektrik tüketerek 4.5 kW ısı üretmesi (COP: 4.5) gerekir. Ancak aşağıdaki hatalar yapıldığında bu oran 1'e 1.5 seviyesine düşer:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Tampon Tank Olmaması:</strong> Kompresör saatte 15-20 kez dur-kalk yapar, her kalkışta aşırı elektrik çeker.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Yanlış Su Sıcaklığı Ayarı:</strong> 35°C su ile ısınabilecek yerden ısıtmaya 55°C su basılması kompresörü boğar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Yardımcı Rezistansın Sürekli Devrede Kalması:</strong> Isı pompası yerine elektrikli soba çalışıyormuş gibi fatura yazar.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-emerald-950/40 to-slate-950 p-6 sm:p-8 rounded-2xl border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-400">Gül-Tekin Mühendislik Çözümü</h4>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-light">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Sisteme doğru hacimde paslanmaz/emaye <strong>Tampon Tank (Buffer Tank)</strong> entegre ederek dur-kalkı %70 azaltıyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Dış hava kompanzasyon eğrisini optimize ederek gereksiz yüksek sıcaklıkta çalışmayı engelliyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Yardımcı rezistansı sadece acil durumlar için kilitliyor, ana yükü %80 tasarruflu Inverter kompresöre yüklüyoruz.</span>
                  </li>
                </ul>
                <div className="mt-5 pt-4 border-t border-emerald-500/20 text-xs font-bold text-emerald-300">
                  👉 Sonuç: Faturalarda ortalama %35 - %45 oranında anında düşüş.
                </div>
              </div>
            </div>

            {/* Problem 2: Insufficient Heating */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  <span>Problem 2</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Hava Soğuduğunda Evin Isınmaması ve Peteklerin Ilık Kalması
                </h3>
                <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-4">
                  En çok ihtiyaç duyulan soğuk kış günlerinde cihazın yeterli ısıyı üretememesi şu yapısal sorunlardan doğar:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span><strong>EVI Teknolojisi Olmaması:</strong> Sıradan cihazlar 0°C altında gaz sıkıştırma gücünü kaybeder.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span><strong>Hidrolik Debi Düşüklüğü:</strong> Tesisat ana boru çaplarının dar çekilmesi sebebiyle su yeterli hızda dönemez.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span><strong>Balanssız Yerden Isıtma:</strong> Reglaj yapılmayan kollektörlerde uzak odalar donarken yakın odalar terletir.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/40 to-slate-950 p-6 sm:p-8 rounded-2xl border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-blue-400">Gül-Tekin Mühendislik Çözümü</h4>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-light">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>-30°C dış hava koşullarında dahi 75°C sıcak su basabilen <strong>EVI Inverter Varmeks</strong> üniteleri konumlandırıyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>Debimetre ile her oda için ayrı hidrolik reglaj ayarı yaparak evin her köşesinde eşit sıcaklık sağlıyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>Frekans kontrollü akıllı sirkülasyon pompaları ile basınç kaybını sıfıra indiriyoruz.</span>
                  </li>
                </ul>
                <div className="mt-5 pt-4 border-t border-blue-500/20 text-xs font-bold text-blue-300">
                  👉 Sonuç: Dışarısı donarken dahi evinizde 23-25°C kesintisiz konfor.
                </div>
              </div>
            </div>

            {/* Problem 3: Frequent Faults & Noise */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-4">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Problem 3</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Sürekli Arıza Kodları, Gürültü ve Defrost Hataları
                </h3>
                <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-4">
                  İklimlendirme cihazlarının erken bozulması veya rahatsız edici ses çıkarması montaj hatalarından kaynaklanır:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">✕</span>
                    <span><strong>Manyetik Pislik Tutucu Eksikliği:</strong> Plaka eşanjör tıkanır, su sirkülasyonu durur ve kompresör yanar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">✕</span>
                    <span><strong>Titreşim Takozu Olmaması:</strong> Dış ünitenin duvarda veya zeminde rezonans gürültüsü yapması.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">✕</span>
                    <span><strong>Yetkili Servis Eksikliği:</strong> Ehil olmayan müdahaleler sonucu arızanın kronikleşmesi.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-purple-950/40 to-slate-950 p-6 sm:p-8 rounded-2xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-purple-400">Gül-Tekin Mühendislik Çözümü</h4>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-light">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Cihaz girişine <strong>Manyetik Tortu & Çamur Ayırıcı</strong> ekleyerek eşanjörü ömür boyu koruyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Özel titreşim sönümleyici yaylı kauçuk takoz montajı ile fısıltı sessizliğinde (53 dB) çalışma sağlıyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>7/24 Bodrum ve Muğla gezici servis araçlarımızla aynı gün müdahale ve orijinal yedek parça temin ediyoruz.</span>
                  </li>
                </ul>
                <div className="mt-5 pt-4 border-t border-purple-500/20 text-xs font-bold text-purple-300">
                  👉 Sonuç: 5 Yıl Kompresör & 3 Yıl Cihaz garantisiyle sıfır arıza güvencesi.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-900/60 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Merak Edilenler</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Isı Pompası Sorunları Hakkında Sıkça Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <h3 className="font-bold text-white text-base sm:text-lg mb-2">
                  {idx + 1}. {item.question}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Consultation CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Isı Pompanızı Maksimum Tasarrufa Ulaştıralım
          </h2>
          <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto font-light">
            Gül-Tekin Mühendislik uzmanları mekanınızı incelesin, verim kaybını çıkarsın ve doğru mühendislik revizyonu ile faturanızı düşürsün.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappHref("0532 317 78 59")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-950 font-bold rounded-full text-sm sm:text-base hover:bg-emerald-50 transition-all shadow-xl"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp ile Ücretsiz Randevu Al</span>
            </a>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-900/60 hover:bg-emerald-900 text-white font-semibold rounded-full text-sm sm:text-base transition-all border border-emerald-400/30"
            >
              <span>İletişim Formunu Doldurun</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
