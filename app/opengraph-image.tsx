import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const alt = '우리 가족 도서관'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function Image() {
 
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc', // slate-50
          backgroundImage: 'radial-gradient(circle at 25px 25px, #e2e8f0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e2e8f0 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '40px 80px',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>
            📚
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: '#1e293b', // slate-800
              marginBottom: 10,
              letterSpacing: '-0.02em',
            }}
          >
            우리 가족 도서관
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#64748b', // slate-500
              marginTop: 10,
            }}
          >
            동네 도서관 실시간 대출 확인 & 맞춤 추천
          </div>
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 24, color: '#94a3b8' }}>woorilib.com</div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
