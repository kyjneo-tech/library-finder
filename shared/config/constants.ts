// API 설정
export const API_CONFIG = {
  LIBRARY_API_BASE: process.env.NEXT_PUBLIC_LIBRARY_API_BASE || 'http://data4library.kr/api',
  KAKAO_MAP_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || '',
} as const;

// 기본 위치 (서울시청)
export const DEFAULT_LOCATION = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || 37.5665,
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG) || 126.978,
} as const;

// 거리 필터 옵션 (미터 단위)
export const DISTANCE_FILTERS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '3km', value: 3000 },
  { label: '전체', value: 50000 },
] as const;

// KDC 도서 분류 (주요 카테고리)
export const BOOK_CATEGORIES = [
  { code: '0', label: '총류' },
  { code: '1', label: '철학' },
  { code: '2', label: '종교' },
  { code: '3', label: '사회과학' },
  { code: '4', label: '자연과학' },
  { code: '5', label: '기술과학' },
  { code: '6', label: '예술' },
  { code: '7', label: '언어' },
  { code: '8', label: '문학' },
  { code: '9', label: '역사' },
] as const;
