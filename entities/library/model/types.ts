import { z } from "zod";

/**
 * 도서관 기본 정보
 */
export const LibrarySchema = z.object({
  libCode: z.string(), // 도서관 코드
  libName: z.string(), // 도서관명
  address: z.string().optional(), // 주소
  tel: z.string().optional(), // 전화번호
  latitude: z.number().optional(), // 위도
  longitude: z.number().optional(), // 경도
  homepage: z.string().optional(), // 홈페이지
  closed: z.string().optional(), // 휴관일
  operatingTime: z.string().optional(), // 운영시간
  bookCount: z.number().optional(), // 장서 수
  established: z.string().optional(), // 개관일
  libraryType: z.string().optional(), // 도서관 유형
});

export type Library = z.infer<typeof LibrarySchema>;

/**
 * 도서관 검색 필터
 */
export interface LibrarySearchFilters {
  region?: string; // 지역코드
  dtl_region?: string; // 세부지역
  libraryType?: string; // 도서관 유형
  pageNo?: number;
  pageSize?: number;
}

/**
 * 도서관 통계 정보
 */
export interface LibraryStats {
  libCode: string;
  libName: string;
  loanCount: number; // 대출 건수
  returnCount: number; // 반납 건수
  bookCount: number; // 장서 수
  year: string;
  month: string;
}
