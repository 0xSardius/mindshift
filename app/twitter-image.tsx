import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Mindshift - Quit Negative Thinking'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 180,
            height: 180,
            borderRadius: 40,
            background: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 700,
              color: '#1e3a5f',
              display: 'flex',
            }}
          >
            M
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#1e3a5f',
            marginBottom: 16,
          }}
        >
          Mindshift
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: '#64748b',
          }}
        >
          Quit Negative Thinking
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
