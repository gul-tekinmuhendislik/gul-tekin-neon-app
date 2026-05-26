'use client'

interface PageRow {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface TopPagesTableProps {
  data: PageRow[]
  loading: boolean
}

export default function TopPagesTable({ data, loading }: TopPagesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded p-4 text-center text-gray-500">
        <p>Henüz sayfa verisi bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded p-4">
      <h3 className="font-semibold mb-3 text-gray-800">En Çok Tıklanan Sayfalar</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 font-medium text-gray-600">Sayfa</th>
              <th className="text-right pb-2 font-medium text-gray-600">Tıklama</th>
              <th className="text-right pb-2 font-medium text-gray-600">Gösterim</th>
              <th className="text-right pb-2 font-medium text-gray-600">CTR</th>
              <th className="text-right pb-2 font-medium text-gray-600">Pozisyon</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 pr-4 max-w-[300px] truncate" title={row.page}>
                  <a
                    href={row.page.startsWith('http') ? row.page : `https://gul-tekinmuhendislik.com${row.page}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {row.page}
                  </a>
                </td>
                <td className="py-2 text-right">{row.clicks.toLocaleString('tr-TR')}</td>
                <td className="py-2 text-right">{row.impressions.toLocaleString('tr-TR')}</td>
                <td className="py-2 text-right">{row.ctr.toFixed(2)}%</td>
                <td className="py-2 text-right">{row.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
