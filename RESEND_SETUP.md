# Resend Email Kurulum Rehberi

## Sorun
Resend API "Not authorized to send emails from gul-tekinmuhendislik.com" hatası veriyor.

## Çözüm Seçenekleri

### Seçenek 1: Resend Ücretsiz Hesap (Önerilen Geçici Çözüm)
Resend ücretsiz hesapta sadece `@resend.dev` uzantılı email adresleri kullanılabilir.

1. `.env.local` dosyasını güncelleyin:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Seçenek 2: Domain Doğrulama (Kalıcı Çözüm)
1. [Resend Dashboard](https://resend.com/domains) üzerinden giriş yapın
2. "Add Domain" butonuna tıklayın
3. `gul-tekinmuhendislik.com` domainini ekleyin
4. DNS kayıtlarını domain sağlayıcınızda (Namecheap, Cloudflare vb.) güncelleyin:
   - SPF kaydı ekleyin
   - DKIM kayıtları ekleyin
   - Domain doğrulamasını bekleyin (genelde 24 saat içinde)

### Seçenek 3: Alternatif Email Servisleri
- **SendGrid**: Aylık 100 email ücretsiz
- **Mailgun**: Aylık 1000 email ücretsiz (3 ay)
- **EmailJS**: Frontend'den direkt email gönderimi

## Mevcut Durum
- API Key: ✅ Aktif
- From Email: ❌ Domain doğrulanmamış
- Database: ✅ Mesajlar kaydediliyor

## Test Endpoint
```bash
curl http://localhost:3001/api/test-email
```

## Acil Çözüm
`.env.local` dosyasında şu değişikliği yapın:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Bu sayede emailler gönderilmeye başlayacaktır. Daha sonra kendi domaininizi doğrulatabilirsiniz.