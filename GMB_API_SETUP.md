# Google My Business API Kurulum Rehberi

## 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com)'a gidin
2. Yeni bir proje oluşturun veya mevcut bir proje seçin
3. Projeniz için faturalandırmayı etkinleştirin

## 2. Google My Business API'yi Etkinleştirme

1. Google Cloud Console'da "APIs & Services" > "Library" bölümüne gidin
2. Aşağıdaki API'leri arayın ve etkinleştirin:
   - **My Business Account Management API** (Zorunlu)
   - **My Business Business Information API** (Zorunlu)
   - Google My Business API
   - My Business Lodging API (opsiyonel)

**ÖNEMLİ:** Yeni service account oluşturduysanız veya proje değiştirdiyseniz, API'leri yeniden etkinleştirmeniz gerekir!

## 3. Service Account Oluşturma

1. "APIs & Services" > "Credentials" bölümüne gidin
2. "Create Credentials" > "Service Account" seçin
3. Service account detaylarını doldurun:
   - Ad: gmb-api-service-account
   - Açıklama: Google My Business API için service account
4. "Create and Continue" tıklayın
5. **ROL SEÇİMİ - Aşağıdaki rolleri ekleyin:**
   - **Service Account Token Creator** (Service Account Token Oluşturucu)
   - **Service Account User** (Service Account Kullanıcısı)
   - **My Business API Admin** (varsa)

   Alternatif olarak daha geniş yetkiler için:
   - **Editor** rolünü seçebilirsiniz

6. "Continue" tıklayın
7. 3. adımda (Grant users access) boş bırakıp "Done" tıklayın

## 4. Service Account Key Oluşturma

1. Oluşturduğunuz service account'a tıklayın
2. "Keys" sekmesine gidin
3. "Add Key" > "Create New Key" seçin
4. JSON formatını seçin ve "Create" tıklayın
5. İndirilen JSON dosyasını proje kök dizinine `service-account-key.json` olarak kaydedin

## 5. Google My Business'a Service Account Erişimi Verme

1. [Google My Business](https://business.google.com) hesabınıza giriş yapın
2. İşletmenizi seçin
3. Ayarlar > Kullanıcılar bölümüne gidin
4. Service account email adresini ekleyin (JSON dosyasındaki `client_email`)
5. "Owner" veya "Manager" rolünü verin

## 6. Environment Variables Ayarlama

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

# Google Business Profile API Configuration (OAuth 2.0)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
NEXT_PUBLIC_ENABLE_GMB=true

## 7. API'yi Test Etme

Kurulumu test etmek için:

```bash
# Business bilgilerini getir
curl http://localhost:3000/api/google-my-business?action=info

# Yorumları getir
curl http://localhost:3000/api/google-my-business?action=reviews

# İstatistikleri getir (son 30 gün)
curl http://localhost:3000/api/google-my-business?action=insights
```

## Kullanılabilir API Endpoints

### GET /api/google-my-business

- `?action=info` - İşletme bilgilerini getirir
- `?action=reviews` - Müşteri yorumlarını getirir
- `?action=insights&startDate=2024-01-01&endDate=2024-01-31` - Belirtilen tarih aralığı için istatistikleri getirir

### POST /api/google-my-business

- `action: 'updateHours'` - Çalışma saatlerini günceller
- `action: 'post'` - Google My Business'a gönderi paylaşır

## Örnek Kullanım (React Component)

```tsx
import { useGoogleMyBusiness } from '@/hooks/useGoogleMyBusiness';

export default function MyComponent() {
  const { businessInfo, reviews, loading, error } = useGoogleMyBusiness();

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div>
      <h2>{businessInfo?.name}</h2>
      <p>{businessInfo?.address}</p>
      <div>
        {reviews.map((review, index) => (
          <div key={index}>
            <p>{review.reviewer.displayName}</p>
            <p>Rating: {review.starRating}</p>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Notlar

- Service account key dosyanızı (`service-account-key.json`) kesinlikle Git'e commit etmeyin
- `.gitignore` dosyanıza `service-account-key.json` ekleyin
- Production'da, key dosyasını güvenli bir şekilde saklayın (örn: environment variable olarak base64 encoded)
- API limitlerine dikkat edin (Google My Business API'nin günlük istek limitleri vardır)

## Sorun Giderme

1. **"No Google My Business account found" hatası**: Service account'ın işletmenize erişimi olduğundan emin olun
2. **Authentication hatası**: Service account key dosyasının doğru yerde olduğunu kontrol edin
3. **API not enabled hatası**: Google Cloud Console'da gerekli API'lerin etkinleştirildiğinden emin olun