import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { randomUUID } from 'crypto';

// .env.local dosyasını yükle
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

// Varmeks Isı Pompaları - Katalogdan çıkarılan tüm ürünler
const varmeksProducts = [
  // VARM UP Serisi - EVI DC Inverter Isı Pompaları
  {
    urun_adi: 'Varmeks VARM UP 8 kW Isı Pompası',
    slug: 'varmeks-varm-up-8kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'EVI DC Inverter ısı pompası, ısıtma, soğutma ve sıcak su. R32 soğutucu akışkan, -30°C\'ye kadar çalışır. Wi-Fi ve IoT destekli, 0,1°C sıcaklık hassasiyeti.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-up-8kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1112008',
      seri: 'VARM UP',
      kapasite_isitma: '1.57~8.40 kW',
      kapasite_sogutma: '0.99~6.22 kW',
      cop: '4.49~4.91',
      eer: '2.85~3.41',
      sogutma_akiskani: 'R32',
      calisma_sicakligi: '-30°C ~ +43°C',
      wifi: 'Evet',
      iot: 'Evet',
      kompressor: 'Panasonic',
      net_agirlik: '110/120 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM UP 13 kW Isı Pompası',
    slug: 'varmeks-varm-up-13kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'EVI DC Inverter ısı pompası, yüksek verimlilikle ısıtma, soğutma ve sıcak su. R32 soğutucu akışkan, -30°C\'ye kadar güvenilir çalışma.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-up-13kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1112013',
      seri: 'VARM UP',
      kapasite_isitma: '4.40~13.00 kW',
      kapasite_sogutma: '2.80~8.20 kW',
      cop: '4.30~4.90',
      eer: '2.48~3.29',
      sogutma_akiskani: 'R32',
      calisma_sicakligi: '-30°C ~ +43°C',
      wifi: 'Evet',
      iot: 'Evet',
      kompressor: 'Panasonic',
      net_agirlik: '140/150 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM UP 16 kW Isı Pompası',
    slug: 'varmeks-varm-up-16kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Üstün performanslı EVI DC Inverter ısı pompası. R32 soğutucu akışkan, yüksek COP değerleri, Wi-Fi kontrol.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-up-16kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1112016',
      seri: 'VARM UP',
      kapasite_isitma: '5.8~15.5 kW',
      kapasite_sogutma: '5.5~11.0 kW',
      cop: '4.23~4.75',
      eer: '2.76~3.29',
      sogutma_akiskani: 'R32',
      calisma_sicakligi: '-30°C ~ +43°C',
      wifi: 'Evet',
      iot: 'Evet',
      kompressor: 'Panasonic',
      net_agirlik: '135/145 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM UP 18 kW Isı Pompası',
    slug: 'varmeks-varm-up-18kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek kapasiteli EVI DC Inverter ısı pompası. -30°C\'de bile çalışır, üstün enerji verimliliği.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-up-18kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1112018',
      seri: 'VARM UP',
      kapasite_isitma: '5.9~18.2 kW',
      kapasite_sogutma: '3.81~11.53 kW',
      cop: '4.43~4.92',
      eer: '2.85~3.43',
      sogutma_akiskani: 'R32',
      calisma_sicakligi: '-30°C ~ +43°C',
      wifi: 'Evet',
      iot: 'Evet',
      kompressor: 'Panasonic',
      net_agirlik: '170/180 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },

  // VARM BOOST Serisi - R290 Isı Pompaları
  {
    urun_adi: 'Varmeks VARM BOOST 8 kW Isı Pompası',
    slug: 'varmeks-varm-boost-8kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Çevre dostu R290 soğutucu akışkanlı ısı pompası. 75°C\'ye kadar sıcak su, -25°C\'ye kadar çalışma. Yüksek COP değerleri, A+++ enerji sınıfı.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-boost-8kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1402008',
      seri: 'VARM BOOST',
      kapasite_isitma: '3.3~8.3 kW',
      kapasite_sogutma: '2.4~5.8 kW',
      cop: '3.81~5.17',
      eer: '2.65~3.04',
      sogutma_akiskani: 'R290/1.0kg',
      max_sicak_su: '75°C',
      calisma_sicakligi: '-25°C ~ +43°C',
      wifi: 'Evet',
      iot: 'Evet',
      scop: '4.64',
      enerji_sinifi: 'A+++',
      net_agirlik: '112 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM BOOST 11 kW Isı Pompası',
    slug: 'varmeks-varm-boost-11kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek verimli R290 ısı pompası. 75°C sıcak su, üstün enerji verimliliği, Wi-Fi kontrol, A+++ enerji sınıfı.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-boost-11kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1402011',
      seri: 'VARM BOOST',
      kapasite_isitma: '4.5~11.4 kW',
      kapasite_sogutma: '3.3~8.2 kW',
      cop: '3.86~5.29',
      eer: '2.67~3.06',
      sogutma_akiskani: 'R290/0.95kg',
      max_sicak_su: '75°C',
      calisma_sicakligi: '-25°C ~ +43°C',
      wifi: 'Evet',
      scop: '4.6',
      enerji_sinifi: 'A+++',
      net_agirlik: '120 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM BOOST 15 kW Isı Pompası',
    slug: 'varmeks-varm-boost-15kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Güçlü R290 ısı pompası. 75°C sıcak su kapasitesi, -25°C\'de çalışma, yüksek verimlilik, A+++ enerji sınıfı.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-boost-15kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB1402015',
      seri: 'VARM BOOST',
      kapasite_isitma: '5.9~14.8 kW',
      kapasite_sogutma: '4.3~10.8 kW',
      cop: '3.86~5.22',
      eer: '2.71~3.10',
      sogutma_akiskani: 'R290/1.45kg',
      max_sicak_su: '75°C',
      scop: '4.65',
      enerji_sinifi: 'A+++',
      net_agirlik: '138 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM BOOST 22 kW Isı Pompası',
    slug: 'varmeks-varm-boost-22kw-isi-pompasi',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek kapasiteli R290 ısı pompası. Ticari ve endüstriyel kullanıma uygun, 75°C sıcak su, üç fazlı güç.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-boost-22kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MB3402022',
      seri: 'VARM BOOST',
      kapasite_isitma: '8.8~22.0 kW',
      kapasite_sogutma: '6.2~15.3 kW',
      cop: '3.81~5.24',
      eer: '2.73~3.12',
      sogutma_akiskani: 'R290/1.4kg',
      max_sicak_su: '75°C',
      scop: '4.69',
      enerji_sinifi: 'A+++',
      guc_kaynagi: '380V/3Ph/50-60Hz',
      net_agirlik: '170 kg'
    })
  },

  // VARM COMMERCIAL DUO Serisi
  {
    urun_adi: 'Varmeks VARM COMMERCIAL DUO 50 kW',
    slug: 'varmeks-varm-commercial-duo-50kw',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Ticari R290 ısı pompası. 78°C sıcak su, -25°C çalışma, yüksek COP, sessiz çalışma (<65 dB). Ticari ve endüstriyel uygulamalar için ideal.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-commercial-duo-50kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MC3402050',
      seri: 'VARM COMMERCIAL DUO',
      kapasite_isitma: '18.4~49.25 kW',
      kapasite_sogutma: '13.8~34.5 kW',
      cop: '3.8~5.62',
      eer: '2.1~2.65',
      sogutma_akiskani: 'R290/4.0kg',
      max_sicak_su: '78°C',
      calisma_sicakligi: '-25°C ~ +43°C',
      gurultu: '≤62 dB(A)',
      guc_kaynagi: '380V/3Ph/50-60Hz',
      net_agirlik: '370 kg',
      boyutlar: '1195×980×1900 mm'
    })
  },
  {
    urun_adi: 'Varmeks VARM COMMERCIAL DUO 92 kW',
    slug: 'varmeks-varm-commercial-duo-92kw',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek kapasiteli ticari R290 ısı pompası. 78°C sıcak su, endüstriyel kullanım, çift ünite sistemi. Büyük tesisler için ideal.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-commercial-duo-92kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0MC3402092',
      seri: 'VARM COMMERCIAL DUO',
      kapasite_isitma: '35.2~92 kW',
      kapasite_sogutma: '25~66 kW',
      cop: '3.86~5.5',
      eer: '2.15~2.8',
      sogutma_akiskani: 'R290/8.0kg',
      max_sicak_su: '78°C',
      calisma_sicakligi: '-25°C ~ +43°C',
      gurultu: '≤65 dB(A)',
      guc_kaynagi: '380V/3Ph/50-60Hz',
      net_agirlik: '745 kg',
      boyutlar: '2510×979×1882 mm'
    })
  },

  // VARM COMMERCIAL POOL Serisi
  {
    urun_adi: 'Varmeks VARM COMMERCIAL POOL 26 kW',
    slug: 'varmeks-varm-commercial-pool-26kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Ticari havuz ısı pompası. 40 m³ havuzlar için, 43°C sıcak su, yüksek COP 6.2, titanyum ısı eşanjörü. Oteller, spor merkezleri için ideal.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-pool-26kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PC3200026',
      seri: 'VARM COMMERCIAL POOL',
      kapasite: '26 kW',
      cop: '6.2',
      sogutma_akiskani: 'R410A',
      max_sicak_su: '43°C',
      calisma_sicakligi: '-7°C ~ +43°C',
      isi_esanjoru: 'PVC Kabuk İçinde Titanyum',
      havuz_hacmi: '40 m³',
      gurultu: '56 dB(A)',
      net_agirlik: '135 kg',
      guc_kaynagi: '380V/3Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM COMMERCIAL POOL 52 kW',
    slug: 'varmeks-varm-commercial-pool-52kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek kapasiteli havuz ısı pompası. 100 m³ havuzlar için, oteller ve aqua parklar için ideal, titanyum eşanjör.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-pool-52kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PC3200052',
      seri: 'VARM COMMERCIAL POOL',
      kapasite: '51.5 kW',
      cop: '6.1',
      sogutma_akiskani: 'R410A',
      max_sicak_su: '43°C',
      isi_esanjoru: 'Titanyum',
      havuz_hacmi: '100 m³',
      gurultu: '58 dB(A)',
      net_agirlik: '280 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM COMMERCIAL POOL 75 kW',
    slug: 'varmeks-varm-commercial-pool-75kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Güçlü ticari havuz ısı pompası. 150 m³ büyük havuzlar için, yüksek verimlilik COP 6.2.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-pool-75kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PC3200075',
      seri: 'VARM COMMERCIAL POOL',
      kapasite: '75 kW',
      cop: '6.2',
      sogutma_akiskani: 'R410A',
      havuz_hacmi: '150 m³',
      gurultu: '60 dB(A)',
      net_agirlik: '248 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM COMMERCIAL POOL 100 kW',
    slug: 'varmeks-varm-commercial-pool-100kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Profesyonel havuz ısı pompası. 200 m³ havuzlar için, titanyum eşanjör, güvenilir performans.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-pool-100kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PC3200100',
      seri: 'VARM COMMERCIAL POOL',
      kapasite: '100 kW',
      cop: '6.0',
      sogutma_akiskani: 'R410A',
      havuz_hacmi: '200 m³',
      gurultu: '62 dB(A)',
      net_agirlik: '352 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM COMMERCIAL POOL 121 kW',
    slug: 'varmeks-varm-commercial-pool-121kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek kapasiteli profesyonel havuz ısıtma sistemi. 250 m³ havuzlar için.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-pool-121kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PC3200121',
      seri: 'VARM COMMERCIAL POOL',
      kapasite: '121 kW',
      cop: '6.0',
      sogutma_akiskani: 'R410A',
      havuz_hacmi: '250 m³',
      gurultu: '62 dB(A)',
      net_agirlik: '450 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM COMMERCIAL POOL 145 kW',
    slug: 'varmeks-varm-commercial-pool-145kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'En yüksek kapasiteli ticari havuz ısı pompası. 300 m³ olimpik havuzlar için ideal, maksimum performans.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-pool-145kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PC3200145',
      seri: 'VARM COMMERCIAL POOL',
      kapasite: '145 kW',
      cop: '6.1',
      sogutma_akiskani: 'R410A',
      havuz_hacmi: '300 m³',
      gurultu: '66 dB(A)',
      net_agirlik: '465 kg'
    })
  },

  // VARM SILENT POOL Serisi
  {
    urun_adi: 'Varmeks VARM SILENT POOL 10 kW',
    slug: 'varmeks-varm-silent-pool-10kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Sessiz havuz ısı pompası. ABS kasa, R32 soğutucu, Smart Life entegrasyonu, 20-40 m³ havuzlar için. Yüksek COP 15.0.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-10kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102010',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '9.50~2.10 kW',
      kapasite_sogutma: '7.2~1.50 kW',
      cop: '6.5~15.0',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '20-40 m³',
      wifi: 'Evet (Smart Life)',
      gurultu: '≤44 dB(A)',
      kasa: 'ABS Plastik',
      kompressor: 'Panasonic',
      net_agirlik: '62 kg',
      guc_kaynagi: '230V/1Ph/50-60Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 11 kW',
    slug: 'varmeks-varm-silent-pool-11kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Sessiz havuz ısıtma sistemi. 25-50 m³ havuzlar için, yüksek COP 14.7, uzaktan kontrol, enerji tasarrufu.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-11kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102011',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '11.00~2.50 kW',
      cop: '6.0~14.7',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '25-50 m³',
      gurultu: '≤43 dB(A)',
      net_agirlik: '64 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 14 kW',
    slug: 'varmeks-varm-silent-pool-14kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Orta kapasite sessiz havuz pompası. 30-60 m³ havuzlar için ideal, COP 15.0.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-14kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102014',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '14.00~3.15 kW',
      cop: '6.5~15.0',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '30-60 m³',
      gurultu: '≤45 dB(A)',
      net_agirlik: '77 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 17 kW',
    slug: 'varmeks-varm-silent-pool-17kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Güçlü ve sessiz havuz ısıtma sistemi. 40-75 m³, Panasonic kompresör, yüksek verimlilik.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-17kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102017',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '17.00~3.75 kW',
      cop: '6.5~15.0',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '40-75 m³',
      kompressor: 'Panasonic',
      gurultu: '≤44 dB(A)',
      net_agirlik: '81 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 20 kW',
    slug: 'varmeks-varm-silent-pool-20kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek performanslı sessiz havuz pompası. 55-100 m³ havuzlar için, COP 14.8.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-20kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102020',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '20.00~4.00 kW',
      cop: '6.0~14.8',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '55-100 m³',
      gurultu: '≤44 dB(A)',
      net_agirlik: '81 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 24 kW',
    slug: 'varmeks-varm-silent-pool-24kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Büyük havuzlar için sessiz ısıtma çözümü. 70-130 m³ kapasite, COP 15.0.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-24kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102024',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '24.00~4.80 kW',
      cop: '6.0~15.0',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '70-130 m³',
      gurultu: '≤45 dB(A)',
      net_agirlik: '95 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 28 kW',
    slug: 'varmeks-varm-silent-pool-28kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Profesyonel sessiz havuz ısıtma sistemi. 60-120 m³ havuzlar için.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-28kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102028',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '28.00~5.60 kW',
      cop: '6.0~15.0',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '60-120 m³',
      gurultu: '≤48 dB(A)',
      net_agirlik: '110 kg'
    })
  },
  {
    urun_adi: 'Varmeks VARM SILENT POOL 33 kW',
    slug: 'varmeks-varm-silent-pool-33kw',
    kategori: 'Havuz Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'En yüksek kapasiteli sessiz havuz pompası. 70-130 m³ büyük havuzlar için.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-silent-pool-33kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VM-0PO1102033',
      seri: 'VARM SILENT POOL',
      kapasite_isitma: '32.50~6.50 kW',
      cop: '6.0~15.0',
      sogutma_akiskani: 'R32',
      havuz_hacmi: '70-130 m³',
      gurultu: '≤49 dB(A)',
      net_agirlik: '115 kg'
    })
  },

  // VARM ALL Serisi - Sıcak Su Depolu Isı Pompaları
  {
    urun_adi: 'Varmeks VARM ALL 150L Sıcak Su Deposu',
    slug: 'varmeks-varm-all-150l-sicak-su-deposu',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Isı pompalı sıcak su deposu. 150L kapasite, 75°C sıcak su, R134A, COP 4.1, Wi-Fi kontrol, emaye kaplı tank, akıllı defrost.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-all-150l',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VARM ALL 150',
      seri: 'VARM ALL',
      kapasite: '149 Litre',
      isitma_kapasitesi: '2400 W',
      cop: '4.1',
      max_sicaklik: '75°C',
      sogutma_akiskani: 'R134A',
      wifi: 'Evet',
      yardimci_isitici: '2 kW',
      boyutlar: 'φ690x1903 mm',
      net_agirlik: '90 kg',
      tank_kaplama: 'Gelişmiş Emaye',
      guc_kaynagi: '220-240V/1Ph/50Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM ALL 200L Sıcak Su Deposu',
    slug: 'varmeks-varm-all-200l-sicak-su-deposu',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Orta kapasite ısı pompalı sıcak su deposu. 200L, yüksek COP 4.1, Wi-Fi kontrol, 75°C sıcak su.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-all-200l',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VARM ALL 200',
      seri: 'VARM ALL',
      kapasite: '197 Litre',
      isitma_kapasitesi: '2400 W',
      cop: '4.1',
      max_sicaklik: '75°C',
      sogutma_akiskani: 'R134A',
      wifi: 'Evet',
      yardimci_isitici: '2 kW',
      net_agirlik: '108 kg',
      guc_kaynagi: '220-240V/1Ph/50Hz'
    })
  },
  {
    urun_adi: 'Varmeks VARM ALL 300L Sıcak Su Deposu',
    slug: 'varmeks-varm-all-300l-sicak-su-deposu',
    kategori: 'Isı Pompaları',
    marka: 'Varmeks',
    aciklama: 'Yüksek kapasiteli ısı pompalı sıcak su deposu. 300L, 75°C, akıllı defrost, emaye tank, haricı elektrikli ısıtıcı.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/varmeks/varm-all-300l',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'VARM ALL 300',
      seri: 'VARM ALL',
      kapasite: '286 Litre',
      isitma_kapasitesi: '2400 W',
      cop: '4.1',
      max_sicaklik: '75°C',
      sogutma_akiskani: 'R134A',
      wifi: 'Evet',
      yardimci_isitici: '2 kW',
      net_agirlik: '118 kg',
      guc_kaynagi: '220-240V/1Ph/50Hz'
    })
  },

  // LG Therma V R32 Monobloc S Serisi
  {
    urun_adi: 'LG Therma V R32 Monobloc S 9 kW',
    slug: 'lg-therma-v-r32-monobloc-s-9kw',
    kategori: 'Isı Pompaları',
    marka: 'LG',
    aciklama: '9 kW kapasiteye sahip LG Therma V R32 Monobloc S, kompakt dış ünite tasarımı ile yüksek verimlilik sağlar. -25 °C dış ortam sıcaklığında dahi çalışabilir, 65 °C\'ye kadar su sıcaklığı üretebilir. A+++ enerji sınıfı ve çevre dostu R32 soğutucu gaz ile düşük enerji tüketimi sunar.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/lg/therma-v-r32-monobloc-9kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'LG Therma V R32 Monobloc S 9kW',
      seri: 'Therma V R32 Monobloc S',
      kapasite: '9 kW',
      sogutma_akiskani: 'R32',
      max_su_sicakligi: '65°C',
      calisma_sicakligi: '-25°C dış ortam',
      enerji_sinifi: 'A+++',
      tip: 'Monoblok (Tek Ünite)',
      ozellikler: ['Kompakt tasarım', 'Kolay kurulum', 'Sessiz çalışma', 'Çevre dostu R32']
    })
  },
  {
    urun_adi: 'LG Therma V R32 Monobloc S 12 kW',
    slug: 'lg-therma-v-r32-monobloc-s-12kw',
    kategori: 'Isı Pompaları',
    marka: 'LG',
    aciklama: '12 kW kapasitesi ile orta ölçekli konutlar ve ticari alanlar için ideal çözümdür. Tek ünite (monoblok) yapısı sayesinde kolay kurulum, yüksek verimlilik ve sessiz çalışma avantajı sağlar. R32 soğutucu gazlıdır, A+++ enerji sınıfındadır.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/lg/therma-v-r32-monobloc-12kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'LG Therma V R32 Monobloc S 12kW',
      seri: 'Therma V R32 Monobloc S',
      kapasite: '12 kW',
      sogutma_akiskani: 'R32',
      max_su_sicakligi: '65°C',
      calisma_sicakligi: '-25°C dış ortam',
      enerji_sinifi: 'A+++',
      tip: 'Monoblok (Tek Ünite)',
      uygulama: 'Orta ölçekli konutlar ve ticari alanlar',
      ozellikler: ['Kolay kurulum', 'Yüksek verimlilik', 'Sessiz çalışma', 'R32 çevre dostu gaz']
    })
  },
  {
    urun_adi: 'LG Therma V R32 Monobloc S 14 kW',
    slug: 'lg-therma-v-r32-monobloc-s-14kw',
    kategori: 'Isı Pompaları',
    marka: 'LG',
    aciklama: '14 kW kapasite sunan LG Therma V R32 Monobloc S, geniş alanlar için ısıtma, soğutma ve sıcak su ihtiyaçlarını tek çözümde sunar. Çevre dostu R32 gazlı, A+++ enerji sınıfına sahip ve -25 °C\'ye kadar çalışabilir.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/lg/therma-v-r32-monobloc-14kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'LG Therma V R32 Monobloc S 14kW',
      seri: 'Therma V R32 Monobloc S',
      kapasite: '14 kW',
      sogutma_akiskani: 'R32',
      max_su_sicakligi: '65°C',
      calisma_sicakligi: '-25°C dış ortam',
      enerji_sinifi: 'A+++',
      tip: 'Monoblok (Tek Ünite)',
      uygulama: 'Geniş alanlar',
      fonksiyonlar: ['Isıtma', 'Soğutma', 'Sıcak Su'],
      ozellikler: ['Tek çözüm', 'Çevre dostu R32', 'Yüksek performans']
    })
  },
  {
    urun_adi: 'LG Therma V R32 Monobloc S 16 kW',
    slug: 'lg-therma-v-r32-monobloc-s-16kw',
    kategori: 'Isı Pompaları',
    marka: 'LG',
    aciklama: 'En yüksek kapasite seçeneği olan 16 kW model, büyük ölçekli yapılar için uygundur. Yüksek verimliliği, 65 °C su çıkış sıcaklığı ve güçlü ısıtma/soğutma performansı ile öne çıkar. R32 gazlı, A+++ sınıfı enerji verimliliğine sahiptir.',
    cloudinary_url: 'https://res.cloudinary.com/dvhmy8merely/image/upload/v1/lg/therma-v-r32-monobloc-16kw',
    fiyat: null,
    stokta: true,
    ozellikler: JSON.stringify({
      model: 'LG Therma V R32 Monobloc S 16kW',
      seri: 'Therma V R32 Monobloc S',
      kapasite: '16 kW (En yüksek kapasite)',
      sogutma_akiskani: 'R32',
      max_su_sicakligi: '65°C',
      calisma_sicakligi: '-25°C dış ortam',
      enerji_sinifi: 'A+++',
      tip: 'Monoblok (Tek Ünite)',
      uygulama: 'Büyük ölçekli yapılar',
      ozellikler: ['Yüksek verimlilik', 'Güçlü performans', '65°C su çıkışı', 'R32 çevre dostu']
    })
  }
];

async function addProducts() {
  try {
    console.log(`🚀 ${varmeksProducts.length} adet Varmeks ürünü ekleniyor...`);
    let addedCount = 0;
    let skippedCount = 0;

    for (const product of varmeksProducts) {
      // Aynı slug'a sahip ürün var mı kontrol et
      const existing = await sql`
        SELECT id FROM urunler WHERE slug = ${product.slug}
      `;

      if (existing.length > 0) {
        console.log(`⏭️  ${product.urun_adi} zaten mevcut, atlanıyor...`);
        skippedCount++;
        continue;
      }

      // Ürünü ekle
      const productId = randomUUID();
      await sql`
        INSERT INTO urunler (
          id,
          urun_adi,
          slug,
          kategori,
          marka,
          aciklama,
          cloudinary_url,
          fiyat,
          stokta,
          ozellikler,
          updated_at
        ) VALUES (
          ${productId},
          ${product.urun_adi},
          ${product.slug},
          ${product.kategori},
          ${product.marka},
          ${product.aciklama},
          ${product.cloudinary_url},
          ${product.fiyat},
          ${product.stokta},
          ${product.ozellikler},
          NOW()
        )
      `;

      console.log(`✅ ${product.urun_adi} eklendi`);
      addedCount++;
    }

    console.log(`\n🎉 İşlem tamamlandı!`);
    console.log(`   ✅ Eklenen: ${addedCount}`);
    console.log(`   ⏭️  Atlanan: ${skippedCount}`);
    console.log(`   📊 Toplam: ${varmeksProducts.length}`);
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

addProducts();
