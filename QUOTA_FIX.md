# Google My Business API Quota Sorunu Çözümü

## Problem
"Quota exceeded for quota metric 'Requests' and limit 'Requests per minute'" hatası alıyorsunuz.

## Çözüm 1: Mevcut Projede Quota Artırma

1. Google Cloud Console'a gidin:
   https://console.cloud.google.com/apis/api/mybusinessaccountmanagement.googleapis.com/quotas?project=770843146139

2. "Requests per minute" satırını bulun (muhtemelen 0 veya çok düşük)

3. Checkbox'ı işaretleyin ve "EDIT QUOTAS" tıklayın

4. Yeni limit girin: 100 veya 1000

5. "SUBMIT REQUEST" - Genelde otomatik onaylanır

## Çözüm 2: Yeni Google Cloud Projesi

Eğer quota artırma işe yaramazsa:

1. Yeni bir Google Cloud projesi oluşturun
2. My Business Account Management API'yi etkinleştirin
3. Yeni OAuth 2.0 credentials oluşturun
4. .env.local dosyasını güncelleyin:
   ```
   GOOGLE_CLIENT_ID=yeni-client-id
   GOOGLE_CLIENT_SECRET=yeni-secret
   ```

## Çözüm 3: Rate Limiting Ekleyin

API çağrılarına rate limiting ekleyerek quota aşımını önleyin:

```typescript
// Dakikada max 10 istek için delay ekle
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API çağrısından önce
await delay(6000); // 6 saniye bekle
```

## Test Etme

Quota artırdıktan sonra:
1. 5 dakika bekleyin (değişikliklerin yansıması için)
2. Tarayıcıyı yenileyin
3. http://localhost:3002/admin/gmb adresine tekrar gidin

## Notlar

- Ücretsiz tier'da varsayılan limit çok düşük (0-10 request/minute)
- Quota artırma ücretsizdir, sadece limit artırılır
- Business hesabınız yoksa API boş dönecektir (bu normal)