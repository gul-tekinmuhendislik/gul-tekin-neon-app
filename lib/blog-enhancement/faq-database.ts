/**
 * FAQ Database for Blog Enhancement
 * Her blog topic'i için hazır FAQ'ler
 */

export interface FAQ {
  question: string;
  answer: string;
}

export const faqDatabase: Record<string, FAQ[]> = {
  "Isı Pompası Sistemleri": [
    {
      question: "Bodrum kışları ısı pompası için çok mu soğuk?",
      answer: "Hayır, tam tersi! Bodrum'da kış ortalaması 10-15°C. Modern ısı pompaları -20°C'ye kadar verimli çalışabilir. Bodrum'da bu sıcaklığa hiç düşmediği için ısı pompası en verimli çalışan bölgelerden biri. Panasonic Aquarea gibi sistemler -20°C'de bile COP 2.5 (yani %250 verimli) sağlarken, Bodrum'un 10°C'lik kışlarında COP 4.5'e çıkıyor."
    },
    {
      question: "Elektrik faturası ne kadar olur? Gerçekten tasarruf eder mi?",
      answer: "Evet, kesinlikle tasarruf ediyor! 200m² villa için kış ayında LPG kombi ile 3,500 TL civarında fatura gelirken, ısı pompası ile 1,500 TL'ye düşüyor (%57 tasarruf). Yıllık bazda (ısıtma + soğutma) LPG+klima 35,000 TL tutarken, ısı pompası sadece 15,000 TL tutuyor. 5 yılda 100,000 TL, 10 yılda 200,000 TL tasarruf demek."
    },
    {
      question: "Hangi marka daha iyi: Panasonic, Mitsubishi, Baymak?",
      answer: "Bütçenize ve ihtiyacınıza göre değişir. Panasonic (COP 4.5, 5 yıl garanti, sessiz) ve Mitsubishi (COP 4.3, 5 yıl garanti) premium kalite sunarken daha pahalıdır. Baymak (COP 3.8, 3 yıl garanti) kalite/fiyat dengesi sunar ve yerli servis avantajı vardır. Gül-Tekin olarak sürekli yaşam için Panasonic/Mitsubishi, yazlıklar için Baymak öneriyoruz."
    },
    {
      question: "Kurulum ne kadar sürer? Evde kalabiliyor muyuz?",
      answer: "Air-to-Air sistemler (split benzeri) 2-3 gün, Air-to-Water sistemler (yerden ısıtma) 3-5 gün sürer. Evet, kurulum sırasında evde kalabilirsiniz. Sadece son gün test ve devreye alma aşamasında 2-3 saat elektrik kesintisi olur. Gül-Tekin olarak sabah 09:00'da başlayıp akşam 18:00'de bitiriyoruz, temiz ve düzenli çalışıyoruz."
    },
    {
      question: "Bakım maliyeti yüksek mi? Ne sıklıkta bakım gerekir?",
      answer: "Yıllık bakım maliyeti 2,500-3,000 TL civarındadır (6 ayda bir profesyonel servis 1,200-1,500 TL). Bu LPG kombi bakımı ile benzerdir (2,000-3,000 TL/yıl). Ancak enerji tasarrufu sayesinde ısı pompası çok daha ekonomiktir. Gül-Tekin müşterilerine yıllık bakım paketi 2,000 TL (2 ziyaret + tüm filtreler dahil) sunuyoruz."
    },
    {
      question: "Yazlık evim var, kışın kapatıyorum. Uygun mu?",
      answer: "Kesinlikle uygun! Hatta yazlıklar için ideal çözüm. Hem ısıtma hem klima olarak çalıştığı için tek sistem yeterli, LPG sipariş stresi yok, sessiz çalışır. Önemli olan yazlık kapatma/açma prosedürünü doğru yapmak: Kışın sistemi boşaltıp dış üniteyi branda ile örtmek, baharda profesyonel açılış servisi yaptırmak gerekir. Gül-Tekin'in yazlık kapatma (800 TL) ve açılış (1,000 TL) servisi mevcuttur."
    },
    {
      question: "Garantisi ne kadar? Arıza olursa ne yapacağım?",
      answer: "Marka garantileri: Kompresör 5 yıl (Panasonic, Mitsubishi), sistem 2-3 yıl. Gül-Tekin Mühendislik olarak +1 yıl ek montaj garantisi veriyoruz (toplamda 3 yıl sistem garantisi). Arıza durumunda bizi arayın, Bodrum yarımadasında 24 saat içinde geliriz. Garanti kapsamındaki arızalar ücretsiz onarılır, yedek parça stokumuz mevcuttur. 15 yılda %98 müşteri memnuniyeti oranımız var."
    }
  ],

  "Su Arıtma Sistemleri": [
    {
      question: "Bodrum suyunun kalitesi nasıl? Su arıtma gerekli mi?",
      answer: "Bodrum'da su sertliği 25-35°F civarında (çok yüksek). Bu beyaz eşya ömrünü kısaltır, cilt kuruluğuna neden olur, bulaşıklarda leke bırakır. Bodrum Belediyesi raporlarına göre bölge sakinlerinin %68'i su kalitesinden şikayetçi. Su arıtma sistemi hem sağlık hem ekonomi açısından şarttır."
    },
    {
      question: "Hangi su arıtma sistemi Bodrum için uygun?",
      answer: "Bodrum'daki yüksek su sertliği için Reverse Osmosis (RO) sistemler en etkilidir. Ancak tek başına RO suyu çok yumuşatır, bu yüzden mineralizasyon aşaması eklenmesi önerilir. Gül-Tekin olarak Pentair veya Aqua Su Arıtma 6 Aşamalı RO + Mineralizasyon sistemlerini öneriyoruz. Kurulum 1-2 gün sürer, 15-25K TL arası maliyeti vardır."
    },
    {
      question: "Bakım maliyeti ne kadar? Ne sıklıkta yapılmalı?",
      answer: "RO sistemlerde filtre değişimi 6 ayda bir (800-1,200 TL), membran değişimi 2-3 yılda bir (2,500-3,500 TL), genel bakım yılda 1 kez (500 TL) gerekir. Yıllık ortalama 1,500-2,000 TL. Gül-Tekin müşterilerine yıllık bakım paketi 1,800 TL (tüm filtreler + 2 bakım ziyareti dahil) sunuyoruz."
    },
    {
      question: "Yazlık evler için özel öneri var mı?",
      answer: "Evet! Yazlık evler için kapatma/açma prosedürü çok önemli: Kış kapatmada (Ekim-Kasım) sistemi boşaltın, filtreleri çıkarıp koruyucu sıvıya alın, ana vanayı kapatın. Yaz açılışta (Nisan-Mayıs) filtreleri değiştirin (eski filtreler kullanılmaz), sistemi dezenfekte edin, 20-30 dakika akan su bırakın. Gül-Tekin yazlık açılış/kapanış servisi 800 TL (tüm işlemler dahil)."
    },
    {
      question: "Hangi markayı tercih etmeliyim?",
      answer: "Bodrum'da 15 yıldır güvendiğimiz markalar: Premium segment için Pentair (ABD, en yüksek kalite, pahalı filtre) ve Aqua Su Arıtma (Türkiye, kalite/fiyat dengesi mükemmel), orta segment için Aquaturk ve Purifair (Bodrum'da yaygın, servis kolay). Gül-Tekin önerisi: Yazlık için Aqua Su Arıtma, sürekli yaşam için Pentair."
    },
    {
      question: "Elektrik tüketimi ne kadar?",
      answer: "RO sistemler çok düşük elektrik harcar. 4 kişilik aile için aylık 15-20 TL, 6+ kişilik aile için 25-35 TL elektrik maliyeti vardır. Hidrofor sistemleriyle kombine edildiğinde aylık toplam 50-80 TL tutar."
    },
    {
      question: "Kurulum ne kadar sürer?",
      answer: "Standart villa kurulumu 1-2 gün sürer: Sistem kurulumu 4-6 saat, test ve ayar 2-3 saat, kullanım eğitimi 1 saat. Yalıkavak, Göltürkbükü, Türkbükü bölgelerinde aynı gün servis imkanımız vardır."
    }
  ],

  "Sulama Sistemleri": [
    {
      question: "Bodrum'da otomatik sulama sistemi gerekli mi?",
      answer: "Kesinlikle gerekli! Bodrum'da yaz aylarında sıcaklık 35-40°C'ye çıkar, nem düşüktür (%30-40). Manuel sulama hem zaman kaybı hem de su israfına neden olur. Otomatik sulama sistemi su tüketimini %40-50 azaltır, bitkiler daha sağlıklı büyür. Villa bahçeleri için damlama sulama, çim alanlar için sprinkler sistem önerilir."
    },
    {
      question: "Hangi sulama sistemi Bodrum için uygun?",
      answer: "Bodrum'un kurak iklimi için damlama sulama en verimlisidir (%95 su tasarrufu). Ağaç ve çalılar için damlama, çim alanlar için pop-up sprinkler, saksı bitkileri için mikro sprinkler önerilir. Gül-Tekin olarak akıllı sulama kontrol ünitesi (hava durumu sensörlü) kullanıyoruz, yağmur yağdığında sistem otomatik durur."
    },
    {
      question: "Kurulum maliyeti ne kadar?",
      answer: "500m² bahçe için damlama sulama sistemi 15-25K TL, pop-up sprinkler sistemi 20-30K TL, kombine sistem 25-40K TL arasındadır. Maliyet bahçe büyüklüğü, bitki türü, su kaynağı ve otomasyon seviyesine göre değişir. Gül-Tekin ücretsiz keşif yaparak detaylı fiyat teklifi sunar."
    },
    {
      question: "Su faturasına etkisi ne olur?",
      answer: "Otomatik sulama sistemi su tüketimini %40-50 azaltır. Manuel sulama ile aylık 300-500 TL su faturası gelirken, otomatik sistemle 150-250 TL'ye düşer. Yıllık 1,800-3,000 TL tasarruf sağlar. Sistem maliyeti 2-3 yılda kendini amorti eder."
    },
    {
      question: "Yazlık villalar için uygun mu?",
      answer: "Çok uygun! Yazlık villalar için uzaktan kontrollü (Wi-Fi/GSM) sistemler idealdir. Telefon uygulamasından sulama programını ayarlayabilir, anlık durum kontrolü yapabilirsiniz. Kışın sistemi kapatma özelliği sayesinde donma riski ortadan kalkar. Gül-Tekin'in akıllı sulama paketi 30-50K TL (kurulum dahil)."
    },
    {
      question: "Bakım gerekiyor mu?",
      answer: "Yılda 2 kez (ilkbahar ve sonbahar) bakım önerilir: Filtre temizliği, vana kontrolleri, damlatıcı temizliği, programlama kontrolü. Profesyonel bakım 800-1,200 TL/ziyaret. Gül-Tekin yıllık bakım paketi 1,500 TL (2 ziyaret dahil)."
    },
    {
      question: "Kuraklık dönemlerinde yeterli oluyor mu?",
      answer: "Evet, damlama sulama sistemi su tasarruflu olduğu için kuraklık dönemlerinde bile yeterlidir. Akıllı kontrol ünitesi nem sensörü sayesinde toprağın su ihtiyacını ölçer, gereksiz sulama yapmaz. Yağmur suyu toplama tankı ile entegre edilirse su tasarrufu %60-70'e çıkar."
    }
  ],

  "Su Depoları ve Hidrofor Sistemleri": [
    {
      question: "Bodrum'da kaç litrelik su deposu yeterli?",
      answer: "Villa büyüklüğüne göre: 4 kişilik 200m² villa için minimum 1,000 lt, 6 kişilik 300m² villa için 2,000 lt, 8+ kişilik veya misafirli villalar için 3,000-5,000 lt önerilir. Yazlıklar için yaz ayı ziyaretçi sayısı dikkate alınmalı. Bodrum'da su kesintileri sık olduğu için yeterli kapasite kritik."
    },
    {
      question: "Polyester mi paslanmaz çelik mi tercih edilmeli?",
      answer: "Bodrum'un tuzlu havasında paslanmaz çelik daha uzun ömürlüdür (20+ yıl vs 10-15 yıl). Ancak polyester daha ekonomiktir (3,000-8,000 TL vs 8,000-20,000 TL). Denize 100m içindeki villalarda paslanmaz çelik, iç kesimlerde polyester tercih edilebilir. Gül-Tekin olarak FDA onaylı gıda sınıfı malzemeler kullanıyoruz."
    },
    {
      question: "Hidrofor gücü nasıl seçilir?",
      answer: "Kat sayısı ve kullanım noktası sayısına göre: 2 katlı villa için 1.0-1.5 HP, 3 katlı villa için 1.5-2.0 HP, 4+ katlı veya havuzlu villalar için 2.5-3.0 HP önerilir. Grundfos, DAB, Pedrollo gibi markalar Bodrum koşullarına uygun. Gül-Tekin ücretsiz hesaplama yaparak doğru kapasiteyi belirler."
    },
    {
      question: "Kurulum süresi ve maliyeti nedir?",
      answer: "Su deposu + hidrofor kurulumu 1-2 gün sürer. Maliyet paket halinde 15-35K TL arasındadır: 1,000 lt polyester + 1.5 HP hidrofor 15-20K TL, 2,000 lt paslanmaz + 2.0 HP hidrofor 25-35K TL. Fiyata kazı, elektrik, tesisat işçiliği dahildir."
    },
    {
      question: "Bakım ne kadar gerekir?",
      answer: "Su deposu yılda 1 kez temizlenmeli (hijyen), hidrofor 6 ayda bir kontrol edilmeli (basınç, motor, membran). Profesyonel bakım: Depo temizliği 800-1,200 TL, hidrofor bakımı 600-800 TL. Gül-Tekin yıllık bakım paketi 1,800 TL (depo temizliği + 2 hidrofor kontrolü dahil)."
    },
    {
      question: "Yazlıklar için özel önlemler var mı?",
      answer: "Evet, kış kapatmada sistem boşaltılmalı (donma riski), vanaları kapatın, elektriği kesin. Yaz açılışta depo hijyen kontrolü, hidrofor test, su sızıntısı kontrolü yapılmalı. Gül-Tekin yazlık açılış/kapanış servisi 1,000 TL (tüm kontroller dahil)."
    },
    {
      question: "Deprem güvenliği nasıl sağlanır?",
      answer: "Bodrum 1. derece deprem bölgesi olduğu için sağlam zemin ve çelik bağlantılar şart. Gül-Tekin olarak depoları betonarme zemine monte ediyoruz, sismik ankraj sistemleri kullanıyoruz, esnek borularla bağlantı yapıyoruz. 15 yılda hiç deprem hasarlı sistem olmadı."
    }
  ],

  "Termosifonik Sistemler": [
    {
      question: "Termosifonik sistem nedir?",
      answer: "Termosifonik sistem, güneş enerjisiyle suyu ısıtan ve elektriksiz çalışan doğal sirkülasyonlu sistemdir. Soğuk su aşağıda, sıcak su yukarıda dolaşır (termodinamik prensip). Bodrum'un 300+ güneşli günü sayesinde yaz aylarında sıcak su ihtiyacının %100'ünü karşılar."
    },
    {
      question: "Elektrikli şofbene göre avantajı nedir?",
      answer: "Termosifonik sistem elektrik harcamaz, yıllık 3,000-5,000 TL tasarruf sağlar. İlk yatırım 8-15K TL, 2-3 yılda amorti olur. 20+ yıl ömrü vardır, bakım maliyeti düşüktür. Çevre dostu, karbon ayak izi sıfırdır."
    },
    {
      question: "Kış aylarında yeterli olur mu?",
      answer: "Bodrum'da kış aylarında da güneşli günler fazladır, ancak su sıcaklığı 40-50°C'ye ulaşır (yaz 60-70°C). Kışın destek elektrikli rezistans veya kombi ile desteklenebilir. Hibrit sistemler yılda %60-70 enerji tasarrufu sağlar."
    },
    {
      question: "Hangi kapasiteyi seçmeliyim?",
      answer: "4 kişilik aile için 150-200 lt, 6 kişilik aile için 250-300 lt önerilir. Villa büyüklüğü ve banyo sayısı dikkate alınmalı. Gül-Tekin Solimpeks ve Eraslan markaları ile çalışıyor."
    },
    {
      question: "Kurulum süresi nedir?",
      answer: "Çatı montajı 1 gün sürer. Maliyet 8-15K TL arasındadır (200 lt sistem + kurulum). Gül-Tekin profesyonel çatı montajı yapıyor, rüzgar ve deprem güvenliği sağlıyor."
    },
    {
      question: "Bakım gerekiyor mu?",
      answer: "Yılda 1 kez profesyonel kontrol önerilir: Boruların kontrolü, ısı transfer sıvısı kontrolü, cam temizliği. Bakım maliyeti 500-800 TL/yıl. Gül-Tekin 3 yıl garanti + ömür boyu destek veriyor."
    },
    {
      question: "Tuzlu hava zarar verir mi?",
      answer: "Kaliteli sistemler (Solimpeks, Eraslan) tuzlu havaya dayanıklı paslanmaz çelik ve özel kaplamalı borular kullanır. Deniz kenarında da sorunsuz çalışır. Gül-Tekin 15 yıldır Bodrum'da kurduğu sistemlerde korozyon problemi olmadı."
    }
  ]
};

export function getFAQByTopic(topic: string): FAQ[] {
  return faqDatabase[topic] || [];
}

export function formatFAQForMarkdown(faqs: FAQ[]): string {
  if (faqs.length === 0) return '';

  let markdown = '\n\n## ❓ Sık Sorulan Sorular\n\n';

  faqs.forEach((faq, index) => {
    markdown += `### ${index + 1}. ${faq.question}\n\n`;
    markdown += `${faq.answer}\n\n`;
    if (index < faqs.length - 1) {
      markdown += '---\n\n';
    }
  });

  return markdown;
}
