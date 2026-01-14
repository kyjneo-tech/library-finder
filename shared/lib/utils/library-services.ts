/**
 * 책바다, 책이음 서비스 참여 도서관 매칭 유틸리티
 * 국립중앙도서관 공식 목록 기반 (2026년 1월 기준)
 */

import { CHAEKBADA_LIBRARIES } from '@/shared/data/chaekbada-libraries';
import { CHAEKIUM_LIBRARIES } from '@/shared/data/chaekium-libraries';

/**
 * 도서관 이름으로 서비스 참여 여부 확인
 * 1. 정확한 목록 매칭 우선
 * 2. 폴백: 휴리스틱 매칭 (목록에 없는 신규 도서관 대응)
 */
export function checkLibraryServices(libName: string) {
  console.log(`[DEBUG] checkLibraryServices called with: ${libName}`);
  
  // 공백 제거하여 정규화
  const normalizedName = libName.replace(/\s+/g, '').trim();

  // 1차: 정확한 목록 매칭 (공백 제거 후 비교)
  let isChaekbada = CHAEKBADA_LIBRARIES.has(normalizedName);
  let isChaekium = CHAEKIUM_LIBRARIES.has(normalizedName);

  if (isChaekbada && isChaekium) {
    return { isChaekbada: true, isChaekium: true };
  }

  // 1.5차: 부분 일치 및 퍼지 매칭 (이름 불일치 해결을 위한 전수 검사)
  // 예: API '과천시정보과학도서관' vs 데이터 '경기과천정보과학도서관'
  // 예: API '경기도교육청과천도서관' vs 데이터 '경기경기도교육청과천도서관'
  
  const REGIONS = /^(경기|서울|인천|강원|충북|충남|전북|전남|경북|경남|제주|부산|대구|광주|대전|울산|세종)/;
  
  // API 이름 정규화 (지역명 접두사 제거)
  const cleanApiName = normalizedName.replace(REGIONS, '');
  // API 이름 초정규화 (시/군/구 제거 - 과천시 vs 과천 매칭용)
  const superCleanApiName = cleanApiName.replace(/시|군|구/g, '');

  // 책이음 검사 (정확한 매칭 실패 시에만 수행)
  if (!isChaekium) {
    for (const lib of CHAEKIUM_LIBRARIES) {
      // 1. 단순 포함 관계
      if (lib.includes(normalizedName) || normalizedName.includes(lib)) {
        isChaekium = true;
        break;
      }
      
      // 2. 지역명 접두사 제거 후 비교
      const cleanLibName = lib.replace(REGIONS, '');
      if (cleanLibName.includes(cleanApiName) || cleanApiName.includes(cleanLibName)) {
        isChaekium = true;
        break;
      }

      // 3. 시/군/구 제거 후 비교 (과천시 vs 과천)
      const superCleanLibName = cleanLibName.replace(/시|군|구/g, '');
      // 너무 짧은 단어 매칭 방지 (최소 2글자 이상)
      if (superCleanApiName.length > 2 && superCleanLibName.length > 2) {
        if (superCleanLibName.includes(superCleanApiName) || superCleanApiName.includes(superCleanLibName)) {
          isChaekium = true;
          break;
        }
      }
    }
  }

  // 책바다 검사 (정확한 매칭 실패 시에만 수행)
  if (!isChaekbada) {
    for (const lib of CHAEKBADA_LIBRARIES) {
      if (lib.includes(normalizedName) || normalizedName.includes(lib)) {
        isChaekbada = true;
        break;
      }
      
      const cleanLibName = lib.replace(REGIONS, '');
      if (cleanLibName.includes(cleanApiName) || cleanApiName.includes(cleanLibName)) {
         isChaekbada = true;
         break;
      }
      
      const superCleanLibName = cleanLibName.replace(/시|군|구/g, '');
      if (superCleanApiName.length > 2 && superCleanLibName.length > 2) {
        if (superCleanLibName.includes(superCleanApiName) || superCleanApiName.includes(superCleanLibName)) {
          isChaekbada = true;
          break;
        }
      }
    }
  }
  
  if (isChaekium || isChaekbada) {
    return {
      isChaekbada,
      isChaekium,
    };
  }

  // 2차: 휴리스틱 폴백 (신규 도서관 대응)
  // 대부분의 공공도서관은 책이음/책바다에 참여
  const isPublic =
    normalizedName.includes('시립') ||
    normalizedName.includes('구립') ||
    normalizedName.includes('군립') ||
    normalizedName.includes('도립') ||
    normalizedName.includes('교육청') ||
    normalizedName.includes('중앙도서관');

  const isEducation = normalizedName.includes('교육청') || normalizedName.includes('교육도서관');

  // 대학도서관은 책바다에 많이 참여
  const isUniversity = normalizedName.includes('대학교') || normalizedName.includes('대학');

  return {
    isChaekbada: isPublic || isUniversity,
    isChaekium: isPublic || isEducation,
  };
}
