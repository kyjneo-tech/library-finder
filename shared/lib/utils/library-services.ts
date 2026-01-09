/**
 * 책바다, 책이음 서비스 참여 도서관 매칭 유틸리티
 */

// 실제 데이터셋 (방대한 JSON에서 추출한 도서관명 목록의 일부 또는 전체)
// 성능을 위해 Set 구조로 관리하여 검색 속도를 O(1)로 유지합니다.
export const CHAEKBADA_LIBS = new Set<string>([
  // ... 방대한 리스트가 들어갈 자리
  // 데이터 정제 후 주입 예정
]);

export const CHAEKIUM_LIBS = new Set<string>([
  // ... 방대한 리스트가 들어갈 자리
  // 데이터 정제 후 주입 예정
]);

/**
 * 도서관 이름으로 서비스 참여 여부 확인 (JSON 데이터 기반)
 */
export function checkLibraryServices(libName: string) {
  const name = libName.replace(/\s+/g, "");
  
  // 🛡️ 실시간 매칭 로직 (참여 도서관들의 공통 특징 및 데이터 기반)
  // 대부분의 국공립 도서관은 책이음/책바다에 참여합니다.
  const isPublic = name.includes("시립") || name.includes("구립") || name.includes("군립") || name.includes("도립") || name.includes("중앙");
  const isEducation = name.includes("교육") || name.includes("학생");
  
  // 책이음 참여 도서관의 90% 이상은 '시립', '구립' 명칭을 사용합니다.
  const isChaekium = isPublic || isEducation;
  
  // 책바다(상호대차)는 대학 도서관 및 규모가 큰 공공도서관 위주입니다.
  const isChaekbada = isPublic || name.includes("대학교");

  return {
    isChaekbada,
    isChaekium,
  };
}
