export interface Hizmet {
  id: string;
  hizmet_adi: string;
  aciklama?: string;
  kategori?: string;
  ana_faaliyet_konusu?: string[];
  resim_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  markalar?: string[];
  marka_text?: string[];
  urunler?: string[];
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  seo_index?: number;
  created_at?: Date;
  updated_at?: Date;
}