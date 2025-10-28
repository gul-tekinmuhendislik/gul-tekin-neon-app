/**
 * CTA (Call-to-Action) Templates for Blog Enhancement
 * Her blog topic'i için özelleştirilmiş CTA
 */

export interface CTAConfig {
  serviceName: string;
  mainBenefit: string;
  brands: string[];
  locations: string[];
  campaign?: string;
}

export const ctaConfigs: Record<string, CTAConfig> = {
  "Isı Pompası Sistemleri": {
    serviceName: "Isı Pompası Sistemleri",
    mainBenefit: "%60 Enerji Tasarrufu",
    brands: ["Panasonic", "Mitsubishi", "Baymak"],
    locations: ["Bodrum", "Yalıkavak", "Göltürkbükü", "Türkbükü"],
    campaign: "İlk yıl bakım ücretsiz + Wi-Fi modülü hediye"
  },
  "Su Arıtma Sistemleri": {
    serviceName: "Su Arıtma Sistemleri",
    mainBenefit: "Sağlıklı Su İçin",
    brands: ["Pentair", "Aqua Su Arıtma", "BWT"],
    locations: ["Bodrum", "Yalıkavak", "Milas"],
    campaign: "Filtre değişimi ilk yıl ücretsiz"
  },
  "Sulama Sistemleri": {
    serviceName: "Otomatik Sulama Sistemleri",
    mainBenefit: "%50 Su Tasarrufu",
    brands: ["Rain Bird", "Hunter", "Netafim"],
    locations: ["Bodrum", "Yalıkavak", "Göltürkbükü"],
    campaign: "Akıllı kontrol ünitesi hediye"
  },
  "Su Depoları ve Hidrofor Sistemleri": {
    serviceName: "Su Deposu ve Hidrofor",
    mainBenefit: "Kesintisiz Su İçin",
    brands: ["Grundfos", "DAB", "Pedrollo"],
    locations: ["Bodrum", "Yalıkavak", "Milas", "Türkbükü"],
    campaign: "İlk yıl ücretsiz bakım"
  },
  "Termosifonik Sistemler": {
    serviceName: "Güneş Enerji Sistemleri",
    mainBenefit: "Elektrik Faturası Sıfır",
    brands: ["Solimpeks", "Eraslan", "Yelkenci"],
    locations: ["Bodrum", "Yalıkavak", "Milas"],
    campaign: "3 yıl garanti + ücretsiz montaj"
  }
};

export function generateCTA(topic: string): string {
  const config = ctaConfigs[topic] || {
    serviceName: topic,
    mainBenefit: "Profesyonel Hizmet",
    brands: ["Grundfos", "Solimpeks", "Eraslan"],
    locations: ["Bodrum", "Yalıkavak", "Milas"],
    campaign: "İlk yıl ücretsiz bakım"
  };

  return `
## 📞 Bodrum'da ${config.serviceName} İçin Hemen Arayın

### ✨ Ücretsiz Keşif ve Fiyat Teklifi - ${config.mainBenefit}

**Gül-Tekin Mühendislik** olarak 15 yıldır Bodrum, Yalıkavak, Türkbükü, Göltürkbükü, Gündoğan, Torba, Gümüşlük ve Milas bölgelerinde ${config.serviceName.toLowerCase()} kuruyoruz.

**✅ Neden Gül-Tekin Mühendislik?**

- ✅ **15+ yıl Bodrum deneyimi** (500+ başarılı proje)
- ✅ **${config.brands.join(', ')} yetkili servis**
- ✅ **Grundfos, Solimpeks, Eraslan distribütörü**
- ✅ **24/7 acil servis** (Bodrum yarımadası)
- ✅ **3 yıl garanti** (marka + montaj)
- ✅ **Ücretsiz keşif ve danışmanlık**
- ✅ **Taksit seçenekleri** (12 aya kadar)
- ✅ **Ömür boyu teknik destek**

---

### 📱 İletişim Bilgileri

**Telefon:** [0252 386 35 54](tel:+902523863554)

**Gsm:** [0532 317 78 59](tel:+905323177859)

**WhatsApp:** [0541 457 30 19](https://wa.me/905414573019?text=Merhaba,%20${config.serviceName}%20hakkında%20bilgi%20almak%20istiyorum) - Hemen mesaj at

**Email:** [info@gul-tekinmuhendislik.com](mailto:info@gul-tekinmuhendislik.com)

**Adres:** Gökçebel Mah. İnönü Cad. 61/D, Yalıkavak, Bodrum, Muğla

**Çalışma Saatleri:** Hafta içi 09:00-18:00, Cumartesi 09:00-17:00

---

### 🎁 ${new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })} Özel Kampanya

**"Blog Okuyorum" dediğinizde:**
- 🎉 **%10 indirim** (5,000-8,000 TL arası tasarruf)
- 🎉 **${config.campaign}**
- 🎉 **Hızlı kurulum garantisi** (Bodrum'da 48 saat içinde)

**Kampanya geçerlilik:** Ay sonuna kadar

[🔗 Ücretsiz Keşif Talep Et](/contact) [💬 WhatsApp'tan Yaz](https://wa.me/905414573019) [📞 Hemen Ara](tel:+902523863554)

---

### 📍 Hizmet Verdiğimiz Bölgeler

**Bodrum Yarımadası:**
Bodrum Merkez • Yalıkavak • Göltürkbükü • Türkbükü • Gündoğan • Torba • Gümüşlük • Bitez • Ortakent • Turgutreis • Konacık • Gümbet

**Milas ve Çevresi:**
Milas Merkez • Ören • Güllük

**Özel Not:** Acil servis için Bodrum yarımadasında **maksimum 2 saat** içinde yerinizde oluruz.

---

## 📚 İlgili İçerikler

**Diğer Blog Yazılarımız:**
- [Su Deposu Sistemleri: Bodrum İçin Kapsamlı Rehber](/blog/su-deposu-sistemleri)
- [Hidrofor Sistemleri: Villa Sahipleri İçin Kılavuz](/blog/hidrofor-sistemleri)
- [Solar Su Isıtma: Bodrum'da Yıllık Tasarruf](/blog/solar-su-isitma)

**İlgili Sayfalarımız:**
- [${config.serviceName} Ürünlerimiz](/urunler)
- [${config.brands[0]} Ürünleri](/markalar/${config.brands[0].toLowerCase().replace(/ /g, '-')})
- [${config.locations[0]} Hizmetlerimiz](/lokasyonlar/${config.locations[0].toLowerCase()})

**Projelerimiz:**
- [Göltürkbükü Villa Projesi](/projeler/golturkbuku-villa)
- [Yalıkavak Lüks Rezidans](/projeler/yalikavak-residence)

---

**Son Güncelleme:** ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}

**Yazar:** Gül-Tekin Mühendislik Teknik Ekibi

**Deneyim:** 15+ yıl Bodrum/Milas bölgesi ${config.serviceName.toLowerCase()}

**⚠️ Uyarı:** Bu yazıdaki fiyatlar ${new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })} itibariyle geçerlidir. Güncel fiyat için lütfen bizi arayın.
`;
}

export function formatCTAForMarkdown(topic: string): string {
  return generateCTA(topic);
}
