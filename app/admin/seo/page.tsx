/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SearchConsoleContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('performance')

  useEffect(() => {
    const success = searchParams.get('success')
    const errorParam = searchParams.get('error')

    if (success === 'true') {
      setStatus('success')
      checkToken()
    } else if (errorParam) {
      setStatus('error')
      setError(`Authentication error: ${errorParam}`)
    } else {
      checkToken()
    }
  }, [searchParams])

  const checkToken = async () => {
    try {
      const response = await fetch('/api/search-console/analytics?action=sites')
      const result = await response.json()

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setStatus('idle')
        } else {
          setStatus('error')
          setError(result.error || 'Failed to check token')
        }
      } else {
        setStatus('success')
        setData(result)
      }
    } catch {
      setStatus('idle')
    }
  }

  const fetchAnalytics = async (action: string) => {
    setStatus('loading')
    try {
      const response = await fetch(`/api/search-console/analytics?action=${action}`)
      const result = await response.json()

      if (result.success) {
        setData(result)
        setStatus('success')
      } else {
        setError(result.error)
        setStatus('error')
      }
    } catch {
      setError('Failed to fetch analytics')
      setStatus('error')
    }
  }

  const submitSitemap = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/search-console/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_sitemap',
          siteUrl: 'https://gul-tekinmuhendislik.com',
          data: {
            sitemapUrl: 'https://gul-tekinmuhendislik.com/sitemap.xml'
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Sitemap submitted successfully!')
        setStatus('success')
      } else {
        setError(result.error)
        setStatus('error')
      }
    } catch {
      setError('Failed to submit sitemap')
      setStatus('error')
    }
  }

  if (status === 'idle' || (status === 'error' && error?.includes('No Search Console token'))) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Google Search Console</h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">SEO Takibi için Yetkilendirme Gerekli</h2>

            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Search Console API&apos;ye bağlanarak sitenizin SEO performansını takip edebilirsiniz.
              </p>

              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Neler yapabilirsiniz?</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Arama performansı analizi</li>
                  <li>Anahtar kelime takibi</li>
                  <li>İndeksleme durumu kontrolü</li>
                  <li>Sitemap yönetimi</li>
                  <li>Core Web Vitals takibi</li>
                  <li>Mobil kullanılabilirlik</li>
                </ul>
              </div>
            </div>

            <a
              href="/api/search-console/auth"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Google ile Yetkilendir
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Google Search Console - SEO Takibi</h1>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          ✅ Search Console bağlantısı başarılı!
        </div>
      )}

      {status === 'error' && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          ❌ Hata: {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => { setActiveTab('performance'); fetchAnalytics('performance'); }}
            className={`pb-2 px-4 ${activeTab === 'performance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            📊 Performans
          </button>
          <button
            onClick={() => { setActiveTab('mobile'); fetchAnalytics('mobile'); }}
            className={`pb-2 px-4 ${activeTab === 'mobile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            📱 Mobil
          </button>
          <button
            onClick={() => { setActiveTab('sitemaps'); fetchAnalytics('sitemaps'); }}
            className={`pb-2 px-4 ${activeTab === 'sitemaps' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            🗺️ Sitemaps
          </button>
          <button
            onClick={() => { setActiveTab('indexing'); fetchAnalytics('indexing'); }}
            className={`pb-2 px-4 ${activeTab === 'indexing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            🔍 İndeksleme
          </button>
        </div>

        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        )}

        {status === 'success' && data && (
          <div className="space-y-6">
            {activeTab === 'performance' && data.totals && (
              <div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Toplam Tıklama</p>
                    <p className="text-2xl font-bold">{data.totals.clicks}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Gösterim</p>
                    <p className="text-2xl font-bold">{data.totals.impressions}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-gray-600">CTR</p>
                    <p className="text-2xl font-bold">{data.totals.ctr?.toFixed(2)}%</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Ort. Pozisyon</p>
                    <p className="text-2xl font-bold">{data.totals.position?.toFixed(1)}</p>
                  </div>
                </div>

                {data.topQueries && (
                  <div>
                    <h3 className="font-semibold mb-3">Top Arama Sorguları</h3>
                    <div className="space-y-2">
                      {data.topQueries.slice(0, 5).map((query: Record<string, any>, i: number) => (
                        <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{query.query}</span>
                          <div className="flex gap-4 text-sm">
                            <span>👆 {query.clicks}</span>
                            <span>👁️ {query.impressions}</span>
                            <span>📍 {query.position.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.topPages && (
                  <div>
                    <h3 className="font-semibold mb-3">Top Sayfalar</h3>
                    <div className="space-y-2">
                      {data.topPages.slice(0, 5).map((page: Record<string, any>, i: number) => (
                        <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="truncate flex-1 mr-4">{page.page}</span>
                          <div className="flex gap-4 text-sm">
                            <span>👆 {page.clicks}</span>
                            <span>👁️ {page.impressions}</span>
                            <span>📍 {page.position.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mobile' && data.devices && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">📱 Mobil</h3>
                  <p>Tıklama: {data.devices.mobile.clicks}</p>
                  <p>Gösterim: {data.devices.mobile.impressions}</p>
                  <p>Pozisyon: {data.devices.mobile.position.toFixed(1)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">💻 Desktop</h3>
                  <p>Tıklama: {data.devices.desktop.clicks}</p>
                  <p>Gösterim: {data.devices.desktop.impressions}</p>
                  <p>Pozisyon: {data.devices.desktop.position.toFixed(1)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">📱 Tablet</h3>
                  <p>Tıklama: {data.devices.tablet.clicks}</p>
                  <p>Gösterim: {data.devices.tablet.impressions}</p>
                  <p>Pozisyon: {data.devices.tablet.position.toFixed(1)}</p>
                </div>
              </div>
            )}

            {activeTab === 'sitemaps' && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={submitSitemap}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Sitemap Gönder
                  </button>
                </div>
                {data.sitemaps && data.sitemaps.length > 0 ? (
                  <div className="space-y-2">
                    {data.sitemaps.map((sitemap: Record<string, any>, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded">
                        <p className="font-semibold">{sitemap.path}</p>
                        <p className="text-sm text-gray-600">
                          Durum: {sitemap.isSitemapsIndex ? 'Index' : 'Sitemap'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Henüz sitemap gönderilmemiş</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchConsolePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8">Loading...</div>}>
      <SearchConsoleContent />
    </Suspense>
  )
}