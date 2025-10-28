export interface Urun {
  id: string;
  urun_adi: string;
  slug?: string | null;
  aciklama?: string | null;
  fiyat?: number | null;
  kategori?: string | null;
  marka?: string | null;
  sku?: string | null;
  stokta?: boolean | null;
  etiketler?: string[] | null;
  gorsel_url?: string | null;
  cloudinary_url?: string | null;
  cloudinary_public_id?: string | null;
  aktif?: boolean | null;
  siralama_no?: number | null;
  ozellikler?: string | null;
  agirlik?: number | null;
  boyutlar?: string | null;
  hizmet_id?: string | null;
  hizmet_adi?: string | null;
  anasayfa_goster?: boolean | null;
  airtable_created_time?: Date | null;
  synced_at?: Date | null;
  updated_at?: Date | null;
}
