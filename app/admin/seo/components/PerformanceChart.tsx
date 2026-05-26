'use client'

interface ChartRow {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface PerformanceChartProps {
  data: ChartRow[]
  metric: 'clicks' | 'impressions' | 'ctr' | 'position'
  loading: boolean
}

export default function PerformanceChart({ data, metric, loading }: PerformanceChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded p-4 text-center text-gray-500">
        <p>Henüz veri bulunmuyor. Verileri senkronize etmek için &quot;Senkronize Et&quot; butonunu kullanın.</p>
      </div>
    )
  }

  const numericValues = data.map((row) => {
    const val = row[metric]
    if (metric === 'ctr') return typeof val === 'number' ? val * 100 : 0
    return typeof val === 'number' ? val : 0
  })
  const maxVal = Math.max(...numericValues, 1)

  const metricLabels: Record<string, string> = {
    clicks: 'Tıklama',
    impressions: 'Gösterim',
    ctr: 'CTR (%)',
    position: 'Pozisyon',
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const formatValue = (v: number) => {
    if (metric === 'ctr') return `${v.toFixed(2)}%`
    if (v >= 1000) return `${(v / 1000).toFixed(1)}B`
    return v.toLocaleString('tr-TR')
  }

  // Determine bar color based on metric
  const barColors: Record<string, string> = {
    clicks: 'bg-blue-500',
    impressions: 'bg-green-500',
    ctr: 'bg-yellow-500',
    position: 'bg-purple-500',
  }

  return (
    <div className="bg-white rounded p-4">
      <h3 className="font-semibold mb-3 text-gray-800">{metricLabels[metric]} Trendi</h3>
      <div className="relative h-40 flex items-end gap-[2px] overflow-x-auto pb-1">
        {data.map((row, idx) => {
          const val = numericValues[idx]
          const heightPct = (val / maxVal) * 100
          return (
            <div
              key={row.date}
              className="flex-1 min-w-[6px] group relative"
            >
              <div
                className={`${barColors[metric]} rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                style={{ height: `${Math.max(heightPct, 1)}%` }}
                title={`${formatDate(row.date)}: ${formatValue(val)}`}
              >
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {formatDate(row.date)}: {formatValue(val)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* X-axis labels (show every Nth label) */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        {data.length > 0 && (
          <>
            <span>{formatDate(data[0].date)}</span>
            {data.length > 2 && (
              <span>{formatDate(data[Math.floor(data.length / 2)].date)}</span>
            )}
            <span>{formatDate(data[data.length - 1].date)}</span>
          </>
        )}
      </div>
    </div>
  )
}
