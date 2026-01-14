import { ImageResponse } from 'next/og';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';

export const runtime = 'edge';
export const alt = '책 상세 정보';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ isbn: string }> }) {
  const { isbn } = await params;
  const book = await bookRepository.getBookDetail(isbn);

  if (!book) {
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 900 }}>📚</div>
        <div style={{ fontSize: 40, fontWeight: 700, marginTop: 20 }}>책을 찾을 수 없습니다</div>
      </div>,
      { ...size }
    );
  }

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(circle at 25px 25px, #e2e8f0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e2e8f0 2%, transparent 0%)',
        backgroundSize: '100px 100px',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '40px 60px',
          gap: 15,
        }}
      >
        <div style={{ fontSize: 48 }}>📚</div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#1e293b',
          }}
        >
          우리 가족 도서관
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: '0 60px 60px 60px',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {/* 책 이미지 영역 */}
        {book.bookImageURL && (
          <div
            style={{
              display: 'flex',
              width: 280,
              height: 400,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              border: '4px solid white',
            }}
          >
            <img
              src={book.bookImageURL}
              alt={book.title}
              width={280}
              height={400}
              style={{
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* 책 정보 영역 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 20,
            backgroundColor: 'white',
            padding: 40,
            borderRadius: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* 제목 */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#1e293b',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {book.title}
          </div>

          {/* 저자 */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#a855f7',
              marginTop: 10,
            }}
          >
            {book.author}
          </div>

          {/* 출판 정보 */}
          <div
            style={{
              display: 'flex',
              gap: 15,
              flexWrap: 'wrap',
              marginTop: 20,
            }}
          >
            {book.publisher && (
              <div
                style={{
                  fontSize: 18,
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  padding: '8px 16px',
                  borderRadius: 8,
                }}
              >
                {book.publisher}
              </div>
            )}
            {book.publishYear && (
              <div
                style={{
                  fontSize: 18,
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  padding: '8px 16px',
                  borderRadius: 8,
                }}
              >
                {book.publishYear}년
              </div>
            )}
          </div>

          {/* 태그 */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#d1fae5',
                padding: '6px 14px',
                borderRadius: 8,
              }}
            >
              ✓ 도서관 대출 가능
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
