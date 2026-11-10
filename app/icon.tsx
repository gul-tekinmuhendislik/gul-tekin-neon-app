import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1e3a5f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
          fontFamily: 'Arial, sans-serif',
          fontSize: 280,
          fontWeight: 'bold',
        }}
      >
        GT
      </div>
    ),
    {
      ...size,
    }
  )
}