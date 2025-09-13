# Google My Business OAuth 2.0 Kurulum Rehberi

## OAuth 2.0 Neden Gerekli?

Google My Business API'nin yeni versiyonları, Service Account yerine OAuth 2.0 kullanmayı gerektiriyor. Bu, kullanıcının Google hesabıyla giriş yapmasını sağlar.

## 1. OAuth 2.0 Client ID Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com) açın
2. **APIs & Services** → **Credentials** gidin
3. **Create Credentials** → **OAuth client ID** seçin
4. **Application type**: Web application
5. **Name**: GMB OAuth Client
6. **Authorized redirect URIs** ekleyin:
   - Development: `http://localhost:3000/api/google/callback`
   - Production: `https://ai.gul-tekinmuhendislik.com/api/google/callback`
7. **Create** tıklayın
8. Client ID ve Client Secret'ı kopyalayın

## 2. OAuth Consent Screen Yapılandırma

1. **APIs & Services** → **OAuth consent screen** gidin
2. **User Type**: External seçin (veya Internal, eğer sadece organizasyon içi kullanım ise)
3. Uygulama bilgilerini doldurun:
   - App name: Gül-Tekin Mühendislik GMB
   - User support email: email adresiniz
   - Developer contact: email adresiniz
4. **Scopes** ekleyin:
   - `https://www.googleapis.com/auth/business.manage`
5. Test users ekleyin (development aşamasında)
6. **Save and Continue**

## 3. Environment Variables Güncelleme

`.env.local` dosyanıza ekleyin:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 4. Kullanım

### Admin Paneli

1. Tarayıcıda açın: `http://localhost:3002/admin/gmb`
2. "Google ile Giriş Yap" butonuna tıklayın
3. Google hesabınızla giriş yapın
4. İzinleri onaylayın
5. Google My Business hesaplarınız listelenecek

### API Endpoints

#### OAuth ile Authentication
```bash
# Google OAuth login sayfasına yönlendirir
GET /api/google/auth
```

#### Callback (Otomatik)
```bash
# Google'dan dönen authorization code'u işler
GET /api/google/callback?code=xxx
```

#### GMB Data Endpoints
```bash
# Hesapları listele
GET /api/google-my-business/oauth?action=accounts

# Lokasyonları listele
GET /api/google-my-business/oauth?action=locations&accountId=accounts/xxxxx
```

## 5. Güvenlik Notları

- Client Secret'ı kesinlikle public repoya commit etmeyin
- Production'da HTTPS kullanın
- Refresh token'ları güvenli şekilde saklayın
- Token'ları cookie'de httpOnly flag ile saklayın

## 6. Sorun Giderme

### "Redirect URI mismatch" hatası
- Google Cloud Console'da Authorized redirect URIs'i kontrol edin
- URL'in tam olarak eşleştiğinden emin olun (trailing slash dahil)

### "Access blocked" hatası
- OAuth consent screen'i yapılandırdığınızdan emin olun
- Test users listesine email'inizi ekleyin

### Token expired
- Sistem otomatik olarak refresh token kullanarak yeni access token alır
- Manuel olarak tekrar giriş yapmak için `/api/google/auth` adresine gidin

## 7. Production Deployment

1. Vercel'de environment variables ekleyin:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. Google Cloud Console'da production URL'lerini ekleyin:
   - Authorized redirect URI: `https://ai.gul-tekinmuhendislik.com/api/google/callback`

3. OAuth consent screen'i production'a alın (Google review gerekebilir)