import { z } from "zod";

/**
 * 도서 기본 정보
 */
export const BookSchema = z.object({
  isbn: z.string(),
  isbn13: z.string().optional(),
  title: z.string(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  publishYear: z.string().optional(),
  classNo: z.string().optional(), // KDC 분류번호
  className: z.string().optional(), // 분류명
  bookImageURL: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  loanCnt: z.number().optional(), // 대출 횟수
  ranking: z.number().optional(), // 순위
  additionSymbol: z.string().optional(), // ISBN 부가기호 (대상 정보 등)
});

export type Book = z.infer<typeof BookSchema>;

/**
 * 도서 대출 가능 여부 정보
 */
export const BookAvailabilitySchema = z.object({
  isbn: z.string(),
  libraryCode: z.string(),
  libraryName: z.string(),
  hasBook: z.boolean(), // 소장 여부
  loanAvailable: z.boolean(), // 대출 가능 여부
  returnDate: z.string().optional(), // 반납 예정일
  latitude: z.string().optional(), // 위도 (API 응답이 string일 가능성 높음. number로 변환 필요 시 확인)
  longitude: z.string().optional(), // 경도
  homepage: z.string().optional(), // 홈페이지 URL (교차 검증용)
  address: z.string().optional(), // 주소
  tel: z.string().optional(), // 전화번호
  operatingTime: z.string().optional(), // 운영시간
  closed: z.string().optional(), // 휴관일
});

export type BookAvailability = z.infer<typeof BookAvailabilitySchema>;

/**
 * 도서 검색 필터
 */
export interface BookSearchFilters {
  query?: string;
  category?: string; // KDC 분류코드
  author?: string;
  publisher?: string;
  publishYear?: string;
  pageNo?: number;
  pageSize?: number;
}

/**
 * 인기도서 조회 옵션
 */
export interface PopularBooksOptions {
  region?: string; // 지역코드
  age?: string; // 연령대
  gender?: string; // 성별
  addCode?: string; // 부가기호
  kdc?: string; // KDC 분류
  startDt?: string; // 시작일자 (YYYY-MM-DD)
  endDt?: string; // 종료일자 (YYYY-MM-DD)
  pageNo?: number;
  pageSize?: number;
}
