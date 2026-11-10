'use client'

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function GMBAdminContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ name: string; accountName: string; type: string }>>([]);
  const [locations, setLocations] = useState<Array<{ name: string; title: string; address?: { formattedAddress: string }; phoneNumbers?: { primaryPhone: string } }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string; eventId?: string } | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success === 'true') {
      setIsAuthenticated(true);
      saveTokenToDatabase();
      fetchAccounts();
    } else if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
    } else {
      checkAuthStatus();
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/google-my-business/oauth?action=accounts');
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAccounts(data.data.accounts || []);
      } else if (data.authUrl) {
        setIsAuthenticated(false);
      }
    } catch {
      console.error('Auth check failed');
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google-my-business/oauth?action=accounts');
      const data = await response.json();

      if (data.success) {
        setAccounts(data.data.accounts || []);
      } else {
        setError(data.error);
        if (data.authUrl) {
          setIsAuthenticated(false);
        }
      }
    } catch {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/google-my-business/oauth?action=locations&accountId=${accountId}`);
      const data = await response.json();

      if (data.success) {
        setLocations(data.data.locations || []);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = () => {
    window.location.href = '/api/google/auth';
  };

  const saveTokenToDatabase = async () => {
    try {
      const response = await fetch('/api/google-business/save-token', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setTokenSaved(true);
        console.log('Token saved to database successfully');
      } else {
        console.error('Failed to save token:', data.error);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const triggerSync = async () => {
    setLoading(true);
    setSyncStatus(null);
    try {
      const response = await fetch('/api/test-google-business');
      const data = await response.json();

      setSyncStatus(data);
    } catch (error) {
      setSyncStatus({
        success: false,
        message: 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTokenStatus = async () => {
    try {
      const response = await fetch('/api/google-business/save-token');
      const data = await response.json();

      if (data.success && data.token) {
        setTokenSaved(true);
      }
    } catch (error) {
      console.error('Error checking token status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Google My Business Yönetim Paneli
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Kimlik Doğrulama Gerekli</h2>
            <p className="text-gray-600 mb-4">
              Google My Business hesabınıza erişmek için Google ile giriş yapmanız gerekmektedir.
            </p>
            <button
              onClick={handleAuthenticate}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Google ile Giriş Yap
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Token Durumu ve Sync Butonları */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Yönetim İşlemleri</h2>

              <div className="flex gap-4 mb-4">
                {tokenSaved ? (
                  <span className="text-green-600">✓ Token veritabanına kaydedildi</span>
                ) : (
                  <button
                    onClick={saveTokenToDatabase}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Token&apos;ı Veritabanına Kaydet
                  </button>
                )}

                <button
                  onClick={triggerSync}
                  disabled={loading || !tokenSaved}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Senkronize ediliyor...' : 'Google Business Senkronize Et'}
                </button>

                <button
                  onClick={checkTokenStatus}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                >
                  Token Durumunu Kontrol Et
                </button>
              </div>

              {syncStatus && (
                <div className={`p-3 rounded ${syncStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {syncStatus.message || (syncStatus.success ? 'Senkronizasyon başlatıldı' : 'Senkronizasyon başarısız')}
                  {syncStatus.success && syncStatus.eventId && (
                    <p className="text-sm mt-1">Event ID: {syncStatus.eventId}</p>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Google My Business Hesapları</h2>

              {loading && <p>Yükleniyor...</p>}

              {accounts.length > 0 ? (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.name} className="border p-4 rounded">
                      <h3 className="font-semibold">{account.accountName}</h3>
                      <p className="text-sm text-gray-600">ID: {account.name}</p>
                      <p className="text-sm text-gray-600">Tip: {account.type}</p>
                      <button
                        onClick={() => fetchLocations(account.name)}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Lokasyonları Göster →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Henüz hesap bulunamadı.</p>
              )}
            </div>

            {locations.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">İşletme Lokasyonları</h2>
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.name} className="border p-4 rounded">
                      <h3 className="font-semibold">{location.title}</h3>
                      <p className="text-sm text-gray-600">
                        {location.address?.formattedAddress}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tel: {location.phoneNumbers?.primaryPhone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GMBAdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GMBAdminContent />
    </Suspense>
  );
}