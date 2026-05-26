/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import SummaryCards from './components/SummaryCards'
import PerformanceChart from './components/PerformanceChart'
import TopQueriesTable from './components/TopQueriesTable'
import TopPagesTable from './components/TopPagesTable'
import DeviceBreakdown from './components/DeviceBreakdown'
import SitemapStatus from './components/SitemapStatus'

const DATE_RANGES = [
  { label: '7 Gün', days: 7 },
  { label: '14 Gün', days: 14 },
  { label: '28 Gün', days: 28 },
  { label: '90 Gün', days: 90 },
] as const

type TabId = 'performance' | 'trends' | 'mobile' | 'sitemaps' | 'indexing'

interface PerformanceTotals {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface ChartRow {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

function SearchConsoleContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('performance')
  const [dateRange, setDateRange] = useState(28)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [performanceTotals, setPerformanceTotals] = useState<PerformanceTotals | null>(null)
  const [chartData, setChartData] = useState<ChartRow[]>([])
  const [chartLoading, setChartLoading] = useState(false)

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

    // Load last sync timestamp from session storage
    const saved = sessionStorage.getItem('seo_last_sync')
    if (saved) setLastSync(saved)
  }, [searchParams])

  useEffect(() => {
    if (status === 'success') {
      fetchPerformanceData()
    }
  }, [dateRange, status])

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

  const buildPerformanceUrl = useCallback((action: string, days?: number) => {
    const daysToUse = days ?? dateRange
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysToUse)
    return `/api/search-console/analytics?action=${action}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
  }, [dateRange])

  const fetchAnalytics = async (action: string, days?: number) => {
    setStatus('loading')
    try {
      const url = buildPerformanceUrl(action, days)
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setData(result)
        setStatus('success')
        // Persist performance totals if present (for SummaryCards continuity)
        if (result.totals) {
          setPerformanceTotals(result.totals)
        }
      } else {
        setError(result.error)
        setStatus('error')
      }
    } catch {
      setError('Failed to fetch analytics')
      setStatus('error')
    }
  }

  const fetchPerformanceData = async () => {
    setChartLoading(true)
    try {
      const url = buildPerformanceUrl('performance')
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setData(result)
        setStatus('success')

        // Persist performance totals separately so SummaryCards isn't wiped on tab switch
        if (result.totals) {
          setPerformanceTotals(result.totals)
        }

        // Transform daily rows into chart data
        if (result.rows) {
          const dateMap = new Map<string, ChartRow>()
          for (const row of result.rows) {
            const dateKey = row.keys?.[0]
            if (!dateKey) continue
            if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, {
                date: dateKey,
                clicks: 0,
                impressions: 0,
                ctr: 0,
                position: 0,
                count: 0,
              } as any)
            }
            const entry = dateMap.get(dateKey)!
            entry.clicks += row.clicks || 0
            entry.impressions += row.impressions || 0
            entry.position += row.position || 0
            // Use API's ctr if available (more accurate), otherwise compute
            entry.ctr += row.ctr || (row.impressions > 0 ? (row.clicks / row.impressions) : 0)
            ;(entry as any).count++
          }

          const chartRows = Array.from(dateMap.values())
            .map((entry) => ({
              ...entry,
              ctr: (entry as any).count > 0 ? entry.ctr / (entry as any).count : 0,
              position: (entry as any).count > 0 ? entry.position / (entry as any).count : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date))

          // Remove the temp count field
          const cleanRows = chartRows.map((row) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { count: _unused, ...clean } = row as any
            return clean
          })

          setChartData(cleanRows as ChartRow[])
        }
      }
    } catch {
      // Silently fail for chart data
    } finally {
      setChartLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/search-console/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: dateRange }),
      })
      const result = await response.json()

      if (result.success) {
        const now = new Date().toLocaleString('tr-TR')
        setLastSync(now)
        sessionStorage.setItem('seo_last_sync', now)
        // Refresh data after sync
        await fetchPerformanceData()
      } else {
        setError(result.error)
        setStatus('error')
      }
    } catch {
      setError('Senkronizasyon başarısız')
      setStatus('error')
    } finally {
      setSyncing(false)
    }
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    if (tab === 'performance' || tab === 'trends') {
      fetchPerformanceData()
    } else if (tab === 'mobile') {
      fetchAnalytics('mobile')
    } else if (tab === 'sitemaps') {
      fetchAnalytics('sitemaps')
    } else if (tab === 'indexing') {
      fetchAnalytics('indexing')
    }
  }

  const submitSitemap = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/search-console/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_sitemap',
          siteUrl: 'https://gul-tekinmuhendislik.com',
          data: {
            sitemapUrl: 'https://gul-tekinmuhendislik.com/sitemap.xml',
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert('Sitemap başarıyla gönderildi!')
        handleTabChange('sitemaps')
      } else {
        setError(result.error)
        setStatus('error')
      }
    } catch {
      setError('Sitemap gönderme başarısız')
      setStatus('error')
    } finally {
      setSyncing(false)
    }
  }

  // If not authenticated, show auth prompt
  if (status === 'idle' || (status === 'error' && error?.includes('No Search Console token'))) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Google Search Console</h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">
              SEO Takibi için Yetkilendirme Gerekli
            </h2>

            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Search Console API&apos;ye bağlanarak sitenizin SEO performansını takip
                edebilirsiniz.
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

  const totals: PerformanceTotals | null = performanceTotals ?? data?.totals ?? null
  const isLoading = status === 'loading'

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Google Search Console - SEO Takibi
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {syncing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Senkronize Ediliyor...
              </>
            ) : (
              '🔄 Senkronize Et'
            )}
          </button>
          {lastSync && (
            <span className="text-xs text-gray-500">
              Son: {lastSync}
            </span>
          )}
        </div>
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6 flex items-center gap-2 text-sm">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
          ✅ Search Console bağlantısı başarılı!
        </div>
      )}

      {status === 'error' && error && !error.includes('No Search Console token') && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 flex items-center gap-2 text-sm">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
          ❌ Hata: {error}
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Tarih Aralığı:</span>
          {DATE_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setDateRange(range.days)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                dateRange === range.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={totals} loading={isLoading && !data} />

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex flex-wrap border-b">
          {([
            { id: 'performance' as TabId, label: '📊 Performans' },
            { id: 'trends' as TabId, label: '📈 Trendler' },
            { id: 'mobile' as TabId, label: '📱 Mobil' },
            { id: 'sitemaps' as TabId, label: '🗺️ Sitemaps' },
            { id: 'indexing' as TabId, label: '🔍 İndeksleme' },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6">
          {isLoading && !data && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          )}

          {!isLoading && activeTab === 'performance' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopQueriesTable
                  data={data.topQueries || []}
                  loading={false}
                />
                <TopPagesTable
                  data={data.topPages || []}
                  loading={false}
                />
              </div>
            </div>
          )}

          {!isLoading && activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PerformanceChart
                  data={chartData}
                  metric="clicks"
                  loading={chartLoading}
                />
                <PerformanceChart
                  data={chartData}
                  metric="impressions"
                  loading={chartLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PerformanceChart
                  data={chartData}
                  metric="ctr"
                  loading={chartLoading}
                />
                <PerformanceChart
                  data={chartData}
                  metric="position"
                  loading={chartLoading}
                />
              </div>
            </div>
          )}

          {!isLoading && activeTab === 'mobile' && (
            <DeviceBreakdown
              data={data?.devices ?? null}
              loading={false}
            />
          )}

          {!isLoading && activeTab === 'sitemaps' && (
            <SitemapStatus
              data={data?.sitemaps ?? []}
              loading={false}
              onSync={submitSitemap}
              syncing={syncing}
            />
          )}

          {!isLoading && activeTab === 'indexing' && (
            <div className="text-center py-8 text-gray-500">
              {data?.indexing ? (
                <pre className="text-left text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                  {JSON.stringify(data.indexing, null, 2)}
                </pre>
              ) : (
                <p>
                  İndeksleme bilgisi alınamadı. Lütfen sitenizin Search Console&apos;a
                  eklendiğinden emin olun.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
            <div className="h-32 bg-gray-100 rounded mb-6" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>
      }
    >
      <SearchConsoleContent />
    </Suspense>
  )
}
