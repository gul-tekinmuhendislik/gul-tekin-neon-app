'use client'

interface SitemapEntry {
  path: string
  isSitemapsIndex: boolean
  contents?: Array<{
    type: string
    submitted: string
    lastDownloaded: string
    isSitemapsIndex: boolean
  }>
}

interface SitemapStatusProps {
  data: SitemapEntry[]
  loading: boolean
  onSync: () => void
  syncing: boolean
}

export default function SitemapStatus({ data, loading, onSync, syncing }: SitemapStatusProps) {
  if (loading) {
    return (
      <div className="bg-white rounded p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">🗺️ Sitemap Durumu</h3>
        <button
          onClick={onSync}
          disabled={syncing}
          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? 'Gönderiliyor...' : 'Sitemap Gönder'}
        </button>
      </div>

      {!data || data.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz sitemap gönderilmemiş.</p>
      ) : (
        <div className="space-y-2">
          {data.map((sitemap, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    sitemap.isSitemapsIndex ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <span className="font-medium truncate flex-1" title={sitemap.path}>
                  {sitemap.path.split('/').pop() || sitemap.path}
                </span>
                <span className="text-xs text-gray-500">
                  {sitemap.isSitemapsIndex ? 'Index' : 'Sitemap'}
                </span>
              </div>
              {sitemap.contents && sitemap.contents.length > 0 && (
                <p className="text-xs text-gray-500 ml-4">
                  {sitemap.contents.length} alt sitemap
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
