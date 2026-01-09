/**
 * 책바다, 책이음 서비스 참여 도서관 매칭 유틸리티
 * 국립중앙도서관 공식 목록 기반 (2026년 1월 기준)
 */

import { CHAEKBADA_LIBRARIES } from "@/shared/data/chaekbada-libraries";
import { CHAEKIUM_LIBRARIES } from "@/shared/data/chaekium-libraries";

/**
 * 도서관 이름으로 서비스 참여 여부 확인
 * 1. 정확한 목록 매칭 우선
 * 2. 폴백: 휴리스틱 매칭 (목록에 없는 신규 도서관 대응)
 */
export function checkLibraryServices(libName: string) {
  // 공백 제거하여 정규화
  const normalizedName = libName.replace(/\s+/g, "").trim();
  
  // 1차: 정확한 목록 매칭
  const isChaekbadaExact = CHAEKBADA_LIBRARIES.has(normalizedName);
  const isChaekiumExact = CHAEKIUM_LIBRARIES.has(normalizedName);
  
  if (isChaekbadaExact || isChaekiumExact) {
    return {
      isChaekbada: isChaekbadaExact,
      isChaekium: isChaekiumExact,
    };
  }
  
  // 2차: 휴리스틱 폴백 (신규 도서관 대응)
  // 대부분의 공공도서관은 책이음/책바다에 참여
  const isPublic = 
    normalizedName.includes("시립") || 
    normalizedName.includes("구립") || 
    normalizedName.includes("군립") || 
    normalizedName.includes("도립") || 
    normalizedName.includes("중앙도서관");
  
  const isEducation = 
    normalizedName.includes("교육청") || 
    normalizedName.includes("교육도서관");
  
  // 대학도서관은 책바다에 많이 참여
  const isUniversity = normalizedName.includes("대학교") || normalizedName.includes("대학");

  return {
    isChaekbada: isPublic || isUniversity,
    isChaekium: isPublic || isEducation,
  };
}
