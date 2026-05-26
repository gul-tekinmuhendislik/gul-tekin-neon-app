'use client'

interface SummaryData {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export default function SummaryCards({ data, loading }: { data: SummaryData | null; loading: boolean }) {
  const cards = [
    {
      label: 'Toplam Tıklama',
      value: data?.clicks ?? 0,
      color: 'bg-blue-50',
      textColor: 'text-blue-800',
      valueColor: 'text-blue-900',
      format: (v: number) => v.toLocaleString('tr-TR'),
    },
    {
      label: 'Gösterim',
      value: data?.impressions ?? 0,
      color: 'bg-green-50',
      textColor: 'text-green-800',
      valueColor: 'text-green-900',
      format: (v: number) => v.toLocaleString('tr-TR'),
    },
    {
      label: 'CTR',
      value: data?.ctr ?? 0,
      color: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      valueColor: 'text-yellow-900',
      format: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      label: 'Ort. Pozisyon',
      value: data?.position ?? 0,
      color: 'bg-purple-50',
      textColor: 'text-purple-800',
      valueColor: 'text-purple-900',
      format: (v: number) => v.toFixed(1),
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} p-4 rounded animate-pulse`}>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className={`${card.color} p-4 rounded`}>
          <p className={`text-sm ${card.textColor}`}>{card.label}</p>
          <p className={`text-2xl font-bold ${card.valueColor}`}>{card.format(card.value)}</p>
        </div>
      ))}
    </div>
  )
}
