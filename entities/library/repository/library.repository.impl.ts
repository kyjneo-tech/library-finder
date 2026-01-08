import { API_CONFIG } from "@/shared/config/constants";
import { Library, LibrarySearchFilters, LibraryStats, LibrarySchema } from "../model/types";
import { LibraryRepository } from "./library.repository";

export class LibraryRepositoryImpl implements LibraryRepository {
  private readonly baseUrl = API_CONFIG.LIBRARY_API_BASE;
  private readonly authKey = API_CONFIG.LIBRARY_API_KEY;

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append("authKey", this.authKey);
    url.searchParams.append("format", "json");

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
      const data = await this.fetch("libSrch", {
        region: filters?.region,
        dtl_region: filters?.dtl_region,
        libraryType: filters?.libraryType,
        pageNo: filters?.pageNo || 1,
        pageSize: filters?.pageSize || 100,
      });

      const libraries = (data as any).response?.libs || [];
      const totalCount = (data as any).response?.numFound || 0;

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
