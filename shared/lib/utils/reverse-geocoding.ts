
import { REGIONS } from '@/shared/config/region-codes';

export interface ReverseGeoResult {
  code: string;
  name: string;
  depth: 'region' | 'subRegion' | 'district';
}

/**
 * Kakao Reverse Geocoding 결과를 내부 지역 코드로 변환
 * @param region1Depth "경기도", "서울특별시" 등
 * @param region2Depth "성남시 분당구", "종로구", "창원시 의창구" 등
 */
export function mapKakaoRegionToInternalCode(
  region1Depth: string, 
  region2Depth: string
): ReverseGeoResult | null {
  
  // 1. 1단계 매칭 (시/도)
  // 예: "서울" -> "서울특별시" 매칭을 위해 includes 사용 또는 앞글자 매칭
  const region = REGIONS.find(r => r.name.startsWith(region1Depth) || region1Depth.startsWith(r.name));
  
  if (!region) {
    console.warn(`[ReverseGeo] Unknown Region 1Depth: ${region1Depth}`);
    return null;
  }

  // 2. 2단계 매칭 (시/군/구)
  // region2Depth는 "성남시 분당구"처럼 공백으로 구분될 수 있음
  if (!region2Depth) {
    return { code: region.code, name: region.name, depth: 'region' };
  }

  const parts = region2Depth.split(' ');
  const part1 = parts[0]; // "성남시" or "종로구"
  const part2 = parts[1]; // "분당구" or undefined

  // SubRegion 검색
  if (region.subRegions) {
    // 2-1. 첫 번째 파트로 SubRegion 찾기 (예: "성남시")
    const subRegion = region.subRegions.find(sr => sr.name === part1 || sr.name.startsWith(part1));
    
    if (subRegion) {
      // 2-2. 두 번째 파트로 District 찾기 (예: "분당구")
      if (part2 && subRegion.districts) {
        const district = subRegion.districts.find(d => d.name === part2 || d.name.startsWith(part2));
        if (district) {
           return { code: district.code, name: `${region.name} ${subRegion.name} ${district.name}`, depth: 'district' };
        }
      }
      
      // District가 없거나 매칭 안되면 SubRegion 반환
      return { code: subRegion.code, name: `${region.name} ${subRegion.name}`, depth: 'subRegion' };
    }
  }

  // 매칭되는 하위 지역이 없으면 상위 지역 반환
  return { code: region.code, name: region.name, depth: 'region' };
}
