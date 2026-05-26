'use client'

interface DeviceData {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface DeviceBreakdownProps {
  data: {
    mobile: DeviceData
    desktop: DeviceData
    tablet: DeviceData
  } | null
  loading: boolean
}

function DeviceCard({
  icon,
  label,
  data,
  colorClass,
}: {
  icon: string
  label: string
  data: DeviceData
  colorClass: string
}) {
  return (
    <div className={`${colorClass} p-4 rounded`}>
      <h3 className="font-semibold mb-2 text-sm">
        {icon} {label}
      </h3>
      <div className="space-y-1 text-sm">
        <p>Tıklama: <strong>{data.clicks.toLocaleString('tr-TR')}</strong></p>
        <p>Gösterim: <strong>{data.impressions.toLocaleString('tr-TR')}</strong></p>
        <p>CTR: <strong>{(data.ctr * 100).toFixed(2)}%</strong></p>
        <p>Pozisyon: <strong>{data.position.toFixed(1)}</strong></p>
      </div>
    </div>
  )
}

export default function DeviceBreakdown({ data, loading }: DeviceBreakdownProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Mobil', 'Desktop', 'Tablet'].map((label) => (
          <div key={label} className="bg-gray-100 p-4 rounded animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded p-4 text-center text-gray-500">
        <p>Henüz cihaz verisi bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <DeviceCard icon="📱" label="Mobil" data={data.mobile} colorClass="bg-blue-50" />
      <DeviceCard icon="💻" label="Desktop" data={data.desktop} colorClass="bg-gray-50" />
      <DeviceCard icon="📱" label="Tablet" data={data.tablet} colorClass="bg-purple-50" />
    </div>
  )
}
