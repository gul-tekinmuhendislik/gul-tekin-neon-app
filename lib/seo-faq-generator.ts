import { FAQItem } from "@/components/FAQSection";

/**
 * Ürün detay sayfaları için kategori ve özellik bazlı akıllı FAQ üretici
 */
export function generateProductFAQs(product: {
  urun_adi: string;
  kategori?: string;
  marka?: string;
  aciklama?: string;
}): FAQItem[] {
  const name = product.urun_adi;
  const category = (product.kategori || "").toLowerCase();
  const brand = product.marka || "Gül-Tekin Mühendislik";
  const nameUpper = name.toUpperCase();

  // 1. ISI POMPALARI (Varmeks, LG, Solimpeks vb.)
  if (
    category.includes("ısı") ||
    category.includes("pompa") ||
    nameUpper.includes("VARM") ||
    nameUpper.includes("THERMA") ||
    nameUpper.includes("BOOST") ||
    nameUpper.includes("UP")
  ) {
    return [
      {
        question: `${name} kaç metrekarelik (m²) bir ev veya villa için uygundur?`,
        answer: `${name}, sahip olduğu yüksek verimli DC Inverter kapasitesi ile izolasyon durumuna bağlı olarak ortalama 120 m² ile 350 m² arasındaki konut ve villaların ısıtma, soğutma ve kullanım sıcak suyu ihtiyacını tek başına karşılayabilir. Net kapasite hesabı için ücretsiz keşif hizmetimizden yararlanabilirsiniz.`,
      },
      {
        question: `${brand} ısı pompası kışın donar mı ve elektrik tüketimi nasıldır?`,
        answer: `${name}, -25°C / -30°C dondurucu dış ortam sıcaklıklarında dahi donma yapmadan kesintisiz çalışabilen akıllı defrost ve EVI Inverter teknolojisine sahiptir. A+++ enerji sınıfı sayesinde geleneksel elektrikli ısıtıcılara göre %75'e varan elektrik tasarrufu sağlar.`,
      },
      {
        question: `${name} montajı ve devreye alma işlemi nasıl yapılır?`,
        answer: `Gül-Tekin Mühendislik bünyesindeki uzman mühendis ve yetkili servis ekipleri, Bodrum ve tüm Muğla bölgesinde yerinde keşif yaparak hidrolik bağlantı, tampon tank entegrasyonu ve elektrik altyapısını anahtar teslim tamamlar. Cihaz ilk çalıştırması yetkili servis güvencesiyle yapılır.`,
      },
      {
        question: `${brand} ısı pompası garanti kapsamı nedir?`,
        answer: `Varmeks modellerinde 5 yıl kompresör garantisi ve 3 yıl tam cihaz garantisi mevcuttur. LG modellerinde ise 3 yıl resmi distribütör ve servis garantisi sunulmaktadır. Gül-Tekin Mühendislik olarak 7/24 orijinal yedek parça ve teknik servis desteği sağlıyoruz.`,
      },
    ];
  }

  // 2. SU DEPOLARI (Yelkenci, Beşer vb.)
  if (category.includes("depo") || nameUpper.includes("DEPO") || nameUpper.includes("YELKENCİ") || nameUpper.includes("BEŞER")) {
    return [
      {
        question: `${name} gıda güvenliğine uygun ve koku yapmaz mı?`,
        answer: `${name}, UV dayanımlı, %100 geri dönüştürülebilir ve gıda ile temasa uygun sertifikalı hammaddelerden üretilmiştir. Yosun tutmaz, güneş ışınlarına dayanıklıdır ve suyun kokusunu/tadı bozmaz.`,
      },
      {
        question: `Bodrum ve Muğla bölgesinde kaç tonluk su deposu seçilmelidir?`,
        answer: `4-6 kişilik standart bir villa için hidrofor ile beslenen 2 ton ile 5 ton arası su deposu önerilir. Bahçe sulaması veya kuyu suyu kullanımı olan mülklerde 10 ton veya modüler paslanmaz su depoları tercih edilmelidir.`,
      },
      {
        question: `${name} montajı ve hidrofor bağlantısı nasıl yapılır?`,
        answer: `Gül-Tekin Mühendislik ekipleri su deposu yerleşimini düz zemin üzerine yaparak şamandıra, çekvalf, pislik tutucu ve hidrofor bağlantılarını sızdırmazlık garantisiyle tamamlar.`,
      },
    ];
  }

  // 3. HİDROFOR VE POMPALAR (Wepomp, Wilo, Grundfos, Atlantis)
  if (category.includes("hidrofor") || category.includes("pompa") || nameUpper.includes("POMP") || nameUpper.includes("WİLO") || nameUpper.includes("ATLANTİS")) {
    return [
      {
        question: `${name} hidrofor sistemi sesli çalışır mı?`,
        answer: `${name}, yeni nesil motor yapısı ve frekans inverteri teknolojisi sayesinde ultra sessiz çalışma standardına sahiptir. Gece saatlerinde dahi villa içerisinde gürültü oluşturmaz.`,
      },
      {
        question: `Kireçli ve kuyu sularında hidrofor arızalanır mı?`,
        answer: `Cihaz korozyona ve kirece dayanıklı paslanmaz çelik çark ve gövde yapısına sahiptir. Bodrum bölgesindeki kireçli kuyu sularında uzun ömürlü kullanım için girişine tortu ve kireç önleyici filtre takılmasını öneriyoruz.`,
      },
      {
        question: `${name} basınç dalgalanmasını nasıl engeller?`,
        answer: `Entegre genleşme tankı veya akıllı basınç sensörü sayesinde musluk açıldığında su basıncını sabit tutar, ani basınç düşüşlerini ve şok darbeleri engeller.`,
      },
    ];
  }

  // 4. SU ARITMA SİSTEMLERİ
  if (category.includes("arıtma") || category.includes("yumuşatma") || nameUpper.includes("ARITMA") || nameUpper.includes("OSMOZ")) {
    return [
      {
        question: `${name} Bodrum kuyu suyundaki kireci ve bakterileri tamamen temizler mi?`,
        answer: `${name}, çok aşamalı Ters Ozmoz (Reverse Osmosis) ve katyonik reçineli yumuşatma teknolojisi ile kuyu ve şebeke suyundaki kireç, ağır metal, bakteri ve tortuyu %99.8 oranında arıtır.`,
      },
      {
        question: `Filtre değişim ve periyodik bakım sıklığı nedir?`,
        answer: `Ön filtreler 6 ayda bir, membran filtre ise 1.5 - 2 yılda bir kontrol edilip yenilenmelidir. Gül-Tekin Mühendislik periyodik servis hatırlatma ve orijinal filtre temin hizmeti sunmaktadır.`,
      },
    ];
  }

  // 5. GENEL ÜRÜN FAQ (Varsayılan)
  return [
    {
      question: `${name} için Bodrum ve Muğla genelinde yetkili servis ve montaj desteği var mı?`,
      answer: `Evet, Gül-Tekin Mühendislik olarak Bodrum, Milas, Yalıkavak ve Muğla'nın tüm ilçelerinde ${name} için yerinde keşif, yetkili montaj, devreye alma ve teknik servis hizmeti sunmaktayız.`,
    },
    {
      question: `${name} teslimat ve kargo süresi nedir?`,
      answer: `Stokta bulunan ürünlerimiz Muğla bölgesinde aynı gün veya ertesi gün adrese teslim edilir. Özel projelendirme gerektiren sistemlerde montaj planlaması uzman ekibimiz tarafından belirlenir.`,
    },
    {
      question: `Fiyat teklifi ve teknik keşif nasıl talep edebilirim?`,
      answer: `0532 317 78 59 numaralı destek hattımızı arayarak veya web sitemizdeki iletişim formunu doldurarak ücretsiz teknik keşif ve anahtar teslim fiyat teklifi alabilirsiniz.`,
    },
  ];
}

/**
 * Hizmet sayfaları için akıllı FAQ üretici
 */
export function generateServiceFAQs(service: {
  hizmet_adi: string;
  kategori?: string;
  aciklama?: string;
}): FAQItem[] {
  const name = service.hizmet_adi;
  const nameLower = name.toLowerCase();

  if (nameLower.includes("ısı pomp") || nameLower.includes("iklimlendirme")) {
    return [
      {
        question: `${name} sürecinde yerinde keşif ücretli midir?`,
        answer: `Hayır, Gül-Tekin Mühendislik olarak Bodrum, Milas ve tüm Muğla bölgesinde villanız veya işletmeniz için ısı kaybı hesabı ve keşif hizmetini tamamen ücretsiz sunuyoruz.`,
      },
      {
        question: `${name} uygulaması ne kadar sürede tamamlanır?`,
        answer: `Standart bir villa montajı ve devreye alma süreci keşif onayından sonra ortalama 1-3 iş günü içerisinde anahtar teslim olarak tamamlanmaktadır.`,
      },
      {
        question: `Hangi marka ısı pompaları ile çalışıyorsunuz?`,
        answer: `Türkiye'nin yerli üretim gücü Varmeks başta olmak üzere LG Therma V, Solimpeks ve Alarko gibi A+++ enerji sınıfı dünya lideri markaların yetkili satış ve servisliğini yürütmekteyiz.`,
      },
      {
        question: `Mevcut radyatör veya yerden ısıtma sistemine ısı pompası bağlanabilir mi?`,
        answer: `Evet, mevcut kazan, kombi veya radyatör altyapınıza hibrit veya tam bağımsız olarak ısı pompası entegrasyonu başarıyla yapılabilmektedir.`,
      },
    ];
  }

  if (nameLower.includes("su arıtma") || nameLower.includes("yumuşatma")) {
    return [
      {
        question: `${name} öncesinde su analizi yapıyor musunuz?`,
        answer: `Evet, kuyu veya şebeke suyunuzun sertlik (kireç), iletkenlik, TDS ve mikrobiyolojik değerlerini ölçerek tam ihtiyacınıza uygun kapasitede arıtma ve yumuşatma sistemi tasarlıyoruz.`,
      },
      {
        question: `Su arıtma sistemi villa tesisatını ve beyaz eşyaları kireçten korur mu?`,
        answer: `Kesinlikle. Girişe kurulan reçineli su yumuşatma sistemleri suyun sertliğini 0-1 Fr derecesine düşürerek boyler, ısı pompası, bataryalar ve çamaşır/bulaşık makinelerinde kireç oluşumunu %100 engeller.`,
      },
      {
        question: `Filtre değişimlerini kim yapıyor?`,
        answer: `Gül-Tekin Mühendislik periyodik bakım anlaşması kapsamında ekiplerimiz zamanı geldiğinde orijinal filtre değişimlerini ve tuz takviyelerini adresinizde gerçekleştirir.`,
      },
    ];
  }

  if (nameLower.includes("güneş") || nameLower.includes("enerji") || nameLower.includes("ges")) {
    return [
      {
        question: `Güneş enerjisi ve ısı pompası entegrasyonu elektrik faturasını ne kadar düşürür?`,
        answer: `Güneş panelleri (GES) ile beslenen bir ısı pompası sistemi, gündüz üretilen bedava güneş elektriği ile ısıtma/soğutma ve sıcak su sağlayarak elektrik tüketimini %90'a varan oranda sıfırlar.`,
      },
      {
        question: `Çatı statik hesabı ve izin süreçleri nasıl yürütülür?`,
        answer: `Gül-Tekin Mühendislik uzman mühendis kadrosu çatı statik uygunluğunu, trafo gücünü ve gerekli resmi onay süreçlerini anahtar teslim olarak yönetir.`,
      },
    ];
  }

  // Genel Hizmet FAQ
  return [
    {
      question: `${name} için servis ve garanti koşulları nelerdir?`,
      answer: `Gül-Tekin Mühendislik tarafından yapılan tüm ${name} uygulamalarında işçilik ve montaj garantisi ile birlikte 20+ yıllık yetkili mühendislik güvencesi sunulmaktadır.`,
    },
    {
      question: `Hizmet verilen bölgeler nerelerdir?`,
      answer: `Bodrum, Yalıkavak, Turgutreis, Türkbükü, Gündoğan, Milas, Menteşe, Marmaris, Datça, Fethiye ve tüm Muğla ilçelerinde 7/24 hizmet vermekteyiz.`,
    },
    {
      question: `Nasıl randevu veya teklif alabilirim?`,
      answer: `0532 317 78 59 numaralı çağrı hattımızdan veya web sitemiz üzerinden hemen randevu oluşturabilirsiniz.`,
    },
  ];
}
