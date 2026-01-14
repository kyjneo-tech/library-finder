-- 1. 책 표지 이미지 캐시 (영구 보존)
CREATE TABLE IF NOT EXISTS cached_book_covers (
  isbn TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 도서관 기본 정보 캐시 (자주 안 바뀜)
CREATE TABLE IF NOT EXISTS cached_libraries (
  lib_code TEXT PRIMARY KEY,
  lib_name TEXT NOT NULL,
  address TEXT,
  tel TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  homepage TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 인기도서 통계 캐시 (매일 갱신됨)
-- category: 'hot_trend', 'new_books', 'reading_books' 등
CREATE TABLE IF NOT EXISTS cached_popular_books (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  region_code TEXT DEFAULT 'ALL', -- 전국(ALL) 또는 지역코드
  book_data JSONB NOT NULL, -- 책 목록 JSON 배열
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- 캐시 만료 시간
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_popular_books_category_region ON cached_popular_books(category, region_code);
