import { API_CONFIG } from "@/shared/config/constants";
import { Library, LibrarySearchFilters, LibraryStats, LibrarySchema } from "../model/types";
import { LibraryRepository } from "./library.repository";
import { findSubRegionByCode } from "@/shared/config/region-codes";

export class LibraryRepositoryImpl implements LibraryRepository {
  // private readonly baseUrl = API_CONFIG.LIBRARY_API_BASE; // 이제 사용 안 함
  // private readonly authKey = API_CONFIG.LIBRARY_API_KEY; // 이제 사용 안 함

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // ✅ 보안 프록시(/api/libraries) 사용
    const url = new URL(`/api/libraries/${endpoint}`, typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    // authKey 제거

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Details:", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        errorBody: errorText,
      });
      throw new Error(
        `API Error [${response.status}]: ${response.statusText}. Endpoint: ${endpoint}`
      );
    }

    return response.json();
  }

  async getLibraries(filters?: LibrarySearchFilters): Promise<{
    libraries: Library[];
    totalCount: number;
  }> {
    try {
      // 🛡️ [스마트 필터링] API의 dtl_region 필터링 오류 해결을 위한 클라이언트 사이드 필터링
      let targetDistrictName: string | undefined;
      const apiParams = {
        region: filters?.region,
        dtl_region: filters?.dtl_region,
        libraryType: filters?.libraryType,
        pageNo: filters?.pageNo || 1,
        pageSize: filters?.pageSize || 100,
      };

      if (filters?.dtl_region && filters.dtl_region.length === 5) {
        // 1. 지역명 찾기 (예: "33012" -> "서원구")
        const regionInfo = findSubRegionByCode(filters.dtl_region);
        if (regionInfo) {
          // 구(District) 정보가 있으면 구 이름, 없으면 시/군(SubRegion) 이름 사용
          targetDistrictName = regionInfo.district?.name || regionInfo.subRegion.name;
          
          console.log(`[LibraryRepository] 스마트 필터링 활성화: ${targetDistrictName} (코드: ${filters.dtl_region})`);

          // 2. API에는 상위 지역(Region)으로만 요청 (dtl_region 제거)
          // 넉넉하게 500개 요청하여 해당 지역 도서관 모두 확보
          apiParams.region = filters.dtl_region.substring(0, 2);
          delete apiParams.dtl_region;
          apiParams.pageSize = 500; 
        }
      }

      const data = await this.fetch("libSrch", apiParams);

      let libraries = (data as any).response?.libs || [];
      let totalCount = (data as any).response?.numFound || 0;

      // 3. 주소 기반 정밀 필터링 (2단계: 구 -> 시/군)
      if (targetDistrictName && libraries.length > 0) {
        // 1차: 구(District) 이름으로 필터링
        let filteredLibs = libraries.filter((lib: any) => {
           const addr = lib.lib.address || "";
           return addr.includes(targetDistrictName!);
        });

        if (filteredLibs.length > 0) {
           console.log(`[LibraryRepository] ${targetDistrictName} 도서관 ${filteredLibs.length}개 필터링 성공`);
           libraries = filteredLibs;
           totalCount = filteredLibs.length;
        } else {
           // 2차: 구 단위 검색 실패 시, 시/군(SubRegion) 단위로 확장 시도
           // 예: "청원구" 데이터가 없으면 "청주시" 전체라도 보여줌 (충북 전체보다는 나음)
           const regionInfo = findSubRegionByCode(filters?.dtl_region!);
           const subRegionName = regionInfo?.subRegion.name;
           
           if (subRegionName && subRegionName !== targetDistrictName) {
               console.log(`[LibraryRepository] ${targetDistrictName} 결과 없음. ${subRegionName} 단위로 확장 시도.`);
               filteredLibs = libraries.filter((lib: any) => {
                   const addr = lib.lib.address || "";
                   return addr.includes(subRegionName);
               });
               
               if (filteredLibs.length > 0) {
                   libraries = filteredLibs;
                   totalCount = filteredLibs.length;
               } else {
                   // 시/군 단위도 없으면 빈 배열 (Fallback 제거)
                   libraries = [];
                   totalCount = 0;
               }
           } else {
               // 상위 지역이 없거나 같으면 빈 배열
               libraries = [];
               totalCount = 0;
           }
        }
      }

      return {
        libraries: libraries.map((lib: any) =>
          LibrarySchema.parse({
            libCode: lib.lib.libCode,
            libName: lib.lib.libName,
            address: lib.lib.address,
            tel: lib.lib.tel,
            latitude: lib.lib.latitude ? Number(lib.lib.latitude) : undefined,
            longitude: lib.lib.longitude ? Number(lib.lib.longitude) : undefined,
            homepage: lib.lib.homepage,
            closed: lib.lib.closed,
            operatingTime: lib.lib.operatingTime,
            bookCount: lib.lib.bookCount ? Number(lib.lib.bookCount) : undefined,
            established: lib.lib.established,
            libraryType: lib.lib.libraryType,
          })
        ),
        totalCount,
      };
    } catch (error) {
      console.error("Get libraries error:", error);
      return { libraries: [], totalCount: 0 };
    }
  }

  async getLibraryDetail(libCode: string): Promise<Library | null> {
    try {
      const data = await this.fetch("libInfo", { libCode });
      const lib = (data as any).response?.lib;

      if (!lib) return null;

      return LibrarySchema.parse({
        libCode: lib.libCode,
        libName: lib.libName,
        address: lib.address,
        tel: lib.tel,
        latitude: lib.latitude ? Number(lib.latitude) : undefined,
        longitude: lib.longitude ? Number(lib.longitude) : undefined,
        homepage: lib.homepage,
        closed: lib.closed,
        operatingTime: lib.operatingTime,
        bookCount: lib.bookCount ? Number(lib.bookCount) : undefined,
        established: lib.established,
        libraryType: lib.libraryType,
      });
    } catch (error) {
      console.error("Get library detail error:", error);
      return null;
    }
  }

  async getLibraryPopularBooks(libCode: string): Promise<any[]> {
    try {
      const data = await this.fetch("loanItemSrch", { libCode });
      return (data as any).response?.docs || [];
    } catch (error) {
      console.error("Get library popular books error:", error);
      return [];
    }
  }

  async getLibraryStats(
    libCode: string,
    year: string,
    month: string
  ): Promise<LibraryStats | null> {
    try {
      const data = await this.fetch("loanReturnTrend", {
        libCode,
        year,
        month,
      });

      const result = (data as any).response?.result;
      if (!result) return null;

      return {
        libCode,
        libName: result.libName,
        loanCount: Number(result.loanCnt) || 0,
        returnCount: Number(result.returnCnt) || 0,
        bookCount: Number(result.bookCnt) || 0,
        year,
        month,
      };
    } catch (error) {
      console.error("Get library stats error:", error);
      return null;
    }
  }
}

// Singleton 인스턴스
export const libraryRepository = new LibraryRepositoryImpl();
