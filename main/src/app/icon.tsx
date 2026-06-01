import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: 'sans-serif',
          }}
        >
          G
        </span>
      </div>
    ),
    size
  )
}
