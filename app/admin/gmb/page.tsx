'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function GMBAdminContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ name: string; accountName: string; type: string }>>([]);
  const [locations, setLocations] = useState<Array<{ name: string; title: string; address?: { formattedAddress: string }; phoneNumbers?: { primaryPhone: string } }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success === 'true') {
      setIsAuthenticated(true);
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