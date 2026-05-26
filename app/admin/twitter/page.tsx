'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TwitterAdminContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      setMessage('Twitter hesabı başarıyla bağlandı!');
      setIsAuthenticated(true);
    } else if (error) {
      setMessage(`Hata: ${error}`);
    }

    checkAuthStatus();
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/twitter/status');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/twitter';
  };

  const testTweet = async () => {
    try {
      const response = await fetch('/api/twitter/test-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Test tweet from Gül-Tekin Mühendislik! 🚀 #mühendislik #teknoloji'
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Tweet başarıyla gönderildi!');
      } else {
        setMessage(`Tweet gönderilemedi: ${data.error}`);
      }
    } catch {
      setMessage('Tweet gönderme hatası');
    }
  };

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Twitter Entegrasyonu
        </h1>

        {message && (
          <div className={`p-4 rounded mb-4 ${
            message.includes('başarı') ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {message}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Twitter Hesabı Bağla</h2>
            <p className="text-gray-600 mb-4">
              Twitter hesabınızı bağlayarak otomatik tweet gönderimi yapabilirsiniz.
            </p>
            <button
              onClick={handleConnect}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Twitter ile Bağlan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Twitter Hesabı Bağlı ✓</h2>
              <p className="text-gray-600 mb-4">
                Twitter hesabınız başarıyla bağlandı. Artık otomatik paylaşım yapabilirsiniz.
              </p>
              <button
                onClick={testTweet}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Test Tweet Gönder
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Otomatik Paylaşım Ayarları</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span>Yeni blog yazılarını otomatik paylaş</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Yeni projeleri otomatik paylaş</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Günlük içerik özetleri paylaş</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TwitterAdminPage() {
  return (
    <Suspense fallback={<div className="p-8">Yükleniyor...</div>}>
      <TwitterAdminContent />
    </Suspense>
  );
}