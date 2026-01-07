"use client";

import { useEffect } from "react";
import { SearchBar } from "@/features/book-search/ui/search-bar";
import { BottomSheet } from "@/features/bottom-sheet/ui/bottom-sheet";
import { NewArrivals } from "@/features/recommendations/ui/new-arrivals";
import { PopularBooksCarousel } from "@/features/recommendations/ui/popular-books-carousel";
import { TrendingBooks } from "@/features/recommendations/ui/trending-books";
import { useGeolocation } from "@/shared/lib/hooks/use-geolocation";
import { useMapStore } from "@/features/library-map/lib/use-map-store";
import { MapPin } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export default function HomePage() {
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const { setUserLocation, loadLibraries } = useMapStore();

  useEffect(() => {
    if (!geoLoading && latitude && longitude) {
      setUserLocation({ lat: latitude, lng: longitude });
      // TODO: 지역 코드 변환 후 도서관 목록 로드
      loadLibraries();
    }
  }, [latitude, longitude, geoLoading, setUserLocation, loadLibraries]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* 고정된 검색바 */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="p-4 space-y-2">
          <SearchBar />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {geoLoading
                ? "위치 확인 중..."
                : latitude && longitude
                ? `현재 위치: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                : "위치 정보 없음"}
            </span>
            {!geoLoading && latitude && longitude && (
              <Badge variant="secondary" className="text-xs">
                근처 도서관 표시 중
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 지도 영역 (TODO: Kakao Map 컴포넌트) */}
      <div className="absolute top-[120px] left-0 right-0 bottom-[40vh] bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-16 h-16 mx-auto mb-2 opacity-20" />
          <p className="text-sm">지도가 여기에 표시됩니다</p>
          <p className="text-xs mt-1">Kakao Map API 연동 예정</p>
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet>
        <div className="space-y-6">
          <NewArrivals />
          <PopularBooksCarousel />
          <TrendingBooks />
        </div>
      </BottomSheet>
    </div>
  );
}
