import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';

export async function GET() {
  try {
    // Airtable'dan tüm projeleri çek
    const projeler = await getAllProjeler();
    
    // İlk 5 projeyi göster (test için)
    const sampleProjeler = projeler.slice(0, 5).map(proje => ({
      id: proje.id,
      projeAdi: proje.fields['Proje Adı'],
      slug: proje.fields['SEO:slug'],
      aciklama: proje.fields['Açıklama']?.substring(0, 100) + '...',
      mahalle: proje.fields['Mahalle Adı'],
      ilce: proje.fields['İlçe Adı'],
      baslangicTarihi: proje.fields['Proje Başlangıç Tarihi'],
      bitisTarihi: proje.fields['Proje Bitiş Tarihi'],
      projeYili: proje.fields['Proje Yılı'],
      anaFaaliyetKonusu: proje.fields['Ana faaliyet Konusu'],
      resimSayisi: proje.fields['Resimler']?.length || 0
    }));
    
    return NextResponse.json({
      success: true,
      toplamProje: projeler.length,
      ornekProjeler: sampleProjeler,
      mesaj: `Airtable'dan ${projeler.length} proje başarıyla alındı.`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Airtable projeler hatası:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      mesaj: 'Airtable projeler tablosuna ulaşılamadı.'
    }, { status: 500 });
  }
}