'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useMapStore } from '../lib/use-map-store';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { mapKakaoRegionToInternalCode } from '@/shared/lib/utils/reverse-geocoding';
import { RefreshCcw } from 'lucide-react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface LibraryMapProps {
  libraries?: any[];
  onZoomChange?: (level: number) => void; // 🛡️ 줌 레벨 변경 콜백
  userLocation?: { lat: number; lng: number } | null; // 사용자 위치
  serviceFilter?: 'all' | 'chaekium' | 'chaekbada';
  onSearchArea?: (regionCode: string) => Promise<void> | void; // 🛡️ 지도 기반 재검색 콜백
}

export function LibraryMap({
  libraries: externalLibraries,
  onZoomChange,
  userLocation: propsUserLocation,
  serviceFilter,
  onSearchArea,
}: LibraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const {
    userLocation: storeUserLocation,
    libraries: storeLibraries,
    selectedLibrary,
    setSelectedLibrary,
  } = useMapStore();
  const { selectedRegion, selectedSubRegion, selectedDistrict } = useRegionStore();

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const eventListenersRef = useRef<any[]>([]); // 🛡️ 이벤트 리스너 참조 저장
  const lastClickTimeRef = useRef<number>(0); // 🛡️ 마지막 클릭 시간 (디바운싱)
  const lastZoomOutLevelRef = useRef<number>(0); // 🛡️ 마지막 줌아웃 레벨 저장 (중복 호출 방지)
  const initialBoundsSetRef = useRef<boolean>(false); // 🛡️ 초기 범위 설정 완료 여부
  const geocodingInProgressRef = useRef<boolean>(false); // 🛡️ Geocoding 진행 중 플래그
  const isMapInitializedRef = useRef<boolean>(false); // 🛡️ 지도 초기화 완료 여부
  const lastZoomLevelRef = useRef<number>(0); // 🛡️ 마지막 줌 레벨 저장
  const [isMapReady, setIsMapReady] = useState<boolean>(false); // 🛡️ 지도 초기화 상태 (Ref -> State 변경으로 렌더링 트리거)
  const hasPannedToUserRef = useRef<boolean>(false); // 🛡️ 사용자 위치로 이동 완료 여부
  
  // 📍 지도 재검색 관련 상태
  const [showSearchButton, setShowSearchButton] = useState<boolean>(false);
  const lastSearchCenterRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSearchZoomRef = useRef<number>(0); // 🛡️ 마지막 검색 시 줌 레벨
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 🛡️ 사용자 위치: props > store 우선
  const userLocation = propsUserLocation ?? storeUserLocation;

  // 🛡️ 표시할 도서관 목록 결정 (props가 있으면 우선 사용)
  const displayLibraries = externalLibraries || storeLibraries;

  // 🛡️ onZoomChange를 ref로 저장하여 최신 값 참조
  const onZoomChangeRef = useRef(onZoomChange);
  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  // 지도 초기화 (🛡️ CRITICAL: 한 번만 실행되도록 의존성 배열 비움)
  useEffect(() => {
    if (!mapContainer.current) return;
    if (isMapInitializedRef.current) return; // 🛡️ 이미 초기화되었으면 스킵

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      // 초기 중심좌표 설정 (사용자 위치 있으면 거기, 없으면 서울시청)
      const initialCenter = userLocation 
        ? new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
        : new window.kakao.maps.LatLng(37.566826, 126.9786567);

      console.log(
        `[LibraryMap] Initializing map with center: ${initialCenter.toString()}`
      );

      const options = {
        center: initialCenter,
        level: userLocation ? 5 : 8, // 내 위치면 좀 더 상세하게(5), 서울 전체면 넓게(8)
      };

      const map = new window.kakao.maps.Map(mapContainer.current, options);
      mapRef.current = map;
      isMapInitializedRef.current = true;
      setIsMapReady(true); // 🛡️ 상태 업데이트로 다른 useEffect 트리거

      console.log(`[LibraryMap] Map initialized successfully`);

      // 🛡️ 줌 이벤트 리스너: 디바운싱 + 중복 호출 방지
      let zoomTimeout: NodeJS.Timeout;
      window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
        if (zoomTimeout) clearTimeout(zoomTimeout);

        zoomTimeout = setTimeout(() => {
          const level = map.getLevel();
          // 🛡️ 줌 레벨 변경 시 부모에게 알림 (디바운싱 적용됨)
          if (onZoomChangeRef.current && level !== lastZoomLevelRef.current) {
            console.log(`[LibraryMap] Zoom level changed to ${level}`);
            lastZoomLevelRef.current = level;
            onZoomChangeRef.current(level);
          }
          // 줌인 시 레벨 초기화 (다시 줌아웃하면 검색 가능하도록)
          if (level <= 6) {
            lastZoomOutLevelRef.current = 0;
          }
        }, 500); // 0.5초 대기 후 실행
      });

      // 레이아웃 재조정
      setTimeout(() => {
        map.relayout();
        if (userLocation) {
             hasPannedToUserRef.current = true;
        }
      }, 100);
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    }
  }, []); // 🛡️ CRITICAL: 빈 배열로 한 번만 실행

  // 화면 크기 변경 시 relayout
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.relayout();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🛡️ [Fix] 지역이나 필터가 바뀌면 "새로운 검색"으로 간주하여 지도 이동 강제 허용
  useEffect(() => {
    console.log(`[LibraryMap] Region/Filter changed. Resetting interaction flags to force auto-fit.`);
    initialBoundsSetRef.current = false;
    isUserInteractingRef.current = false;
  }, [selectedRegion, selectedDistrict, serviceFilter]);

  // 🛡️ 드래그/줌 시작 시 사용자 인터랙션 플래그 설정
  const isUserInteractingRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;
    
    const map = mapRef.current;
    const dragStartHandler = () => { isUserInteractingRef.current = true; };
    const zoomStartHandler = () => { isUserInteractingRef.current = true; };
    
    // ⚠️ 중요: 목록이 완전히 바뀌면(예: 새 검색) 다시 자동 조정을 허용해야 함
    // 이것은 displayLibraries가 변경될 때 처리
    
    window.kakao.maps.event.addListener(map, 'dragstart', dragStartHandler);
    window.kakao.maps.event.addListener(map, 'zoom_start', zoomStartHandler);
    
    return () => {
      try {
        window.kakao.maps.event.removeListener(map, 'dragstart', dragStartHandler);
        window.kakao.maps.event.removeListener(map, 'zoom_start', zoomStartHandler);
      } catch (e) {}
    };
  }, [mapRef.current]);

  // 🛡️ 내 위치 마커를 위한 Ref (독립적 관리)
  const userOverlayRef = useRef<any>(null);

  // 📍 [Fix] 내 위치 마커 표시 로직 (지도 준비완료 + 위치 있으면 무조건 표시)
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.kakao || !window.kakao.maps) return;

    // 기존 내 위치 마커 제거
    if (userOverlayRef.current) {
      userOverlayRef.current.setMap(null);
      userOverlayRef.current = null;
    }

    if (!userLocation) return;

    const userPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
      
    // 내 위치 마커 디자인 (파란 점 + 펄스 효과)
    const svgContent = `
      <div style="position: relative; width: 24px; height: 24px;">
         <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 2;"></div>
         <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; background-color: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: pulse 1.5s infinite; z-index: 1;"></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      </style>
    `;
      
    const userOverlayContent = document.createElement('div');
    userOverlayContent.innerHTML = svgContent;
    userOverlayContent.style.pointerEvents = 'none'; // 클릭 방해 안 함

    const userOverlay = new window.kakao.maps.CustomOverlay({
      position: userPosition,
      content: userOverlayContent,
      map: mapRef.current,
      zIndex: 1, // 마커 아래, 지도 위
    });
      
    userOverlayRef.current = userOverlay;

    // Cleanup when component unmounts or location changes
    return () => {
      if (userOverlayRef.current) {
        userOverlayRef.current.setMap(null);
      }
    };
  }, [userLocation, isMapReady]); // isMapReady 추가 -> 지도 로드 직후 실행 보장

  // 마커 및 오버레이 렌더링 & 지도 범위 재설정
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.kakao || !window.kakao.maps) {
      return;
    }

    // 🛡️ 기존 이벤트 리스너 명시적으로 제거
    eventListenersRef.current.forEach(({ marker, listener }) => {
      try {
        window.kakao.maps.event.removeListener(marker, 'click', listener);
      } catch (e) {}
    });
    eventListenersRef.current = [];

    // 기존 마커/오버레이 제거
    markersRef.current.forEach((m) => m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    if (displayLibraries.length === 0) {
      // 목록이 비었을 때 플래그 초기화
      initialBoundsSetRef.current = false; 
      isUserInteractingRef.current = false; 

      // 목록이 0개이고 사용자 위치가 있으면 사용자 위치로 이동
      if (userLocation && !hasPannedToUserRef.current && !isUserInteractingRef.current) {
         console.log('[LibraryMap] No libraries. Panning to user location as fallback.');
         const loc = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
         mapRef.current.setCenter(loc);
         hasPannedToUserRef.current = true;
      }
      return;
    }

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasValidPosition = false;

    displayLibraries.forEach((lib) => {
      if (!lib.latitude || !lib.longitude) return;

      const position = new window.kakao.maps.LatLng(lib.latitude, lib.longitude);
      bounds.extend(position);
      hasValidPosition = true;

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map: mapRef.current,
        clickable: true,
      });

      // 커스텀 오버레이
      let content = `<div style="padding:5px; background:white; border:1px solid #ccc; border-radius:5px; font-size:12px; font-weight:bold; white-space:nowrap;">${lib.libName || lib.libraryName}</div>`;

      if (lib.loanAvailable !== undefined) {
        const color = lib.loanAvailable ? 'green' : 'red';
        const text = lib.loanAvailable ? '대출가능' : '대출중';
        content = `<div style="padding:8px; background:white; border:1px solid ${color}; color:${color}; border-radius:12px; font-size:11px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:flex; flex-direction:column; align-items:center; gap:4px; min-width:80px;">
             <span>${text}</span>
             ${lib.homepage ? `<a href="${lib.homepage}" target="_blank" rel="noopener noreferrer" style="color:#666; text-decoration:none; font-size:10px; border:1px solid #eee; padding:2px 6px; border-radius:4px; background:#f8f9fa;">홈페이지 ></a>` : ''}
           </div>`;
      }

      const overlay = new window.kakao.maps.CustomOverlay({
        content: content,
        position: position,
        yAnchor: 2.2,
        map: mapRef.current,
      });

      const clickHandler = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) return;
        lastClickTimeRef.current = now;
        setSelectedLibrary(lib);
      };

      window.kakao.maps.event.addListener(marker, 'click', clickHandler);
      eventListenersRef.current.push({ marker, listener: clickHandler });

      markersRef.current.push(marker);
      overlaysRef.current.push(overlay);
    });

    // 🛡️ 지도 범위 및 카메라 뷰 업데이트 (Centralized Logic)
    if (hasValidPosition) {
       // initialBoundsSetRef가 false이면(새 검색 or 리셋) 무조건 이동
       if (!initialBoundsSetRef.current || !isUserInteractingRef.current) {
          console.log(`[LibraryMap] Auto-fitting bounds (Force: ${!initialBoundsSetRef.current}, UserInteracting: ${isUserInteractingRef.current})`);
          
          mapRef.current.setBounds(bounds);
          initialBoundsSetRef.current = true;

          // 2. [Policy] 서비스 필터에 따른 뷰 정책 적용 (책이음/책바다는 넓은 뷰 보장)
          if (serviceFilter === 'chaekium' || serviceFilter === 'chaekbada') {
             requestAnimationFrame(() => {
                 if (!mapRef.current) return;
                 
                 const currentLevel = mapRef.current.getLevel();
                 // 타겟 레벨: 시/도 단위가 넉넉히 보이는 레벨 10
                 const TARGET_MIN_LEVEL = 10; 
                 
                 console.log(`[LibraryMap] View Policy Check (${serviceFilter}): Current ${currentLevel} vs Target ${TARGET_MIN_LEVEL}`);

                 if (currentLevel < TARGET_MIN_LEVEL) {
                    console.log(`[LibraryMap] 🔭 Enforcing Wide View (Level ${TARGET_MIN_LEVEL})`);
                    mapRef.current.setLevel(TARGET_MIN_LEVEL, { animate: true });
                 }
             });
          }
       } else {
         console.log(`[LibraryMap] User interacting & already bounded. Skipping auto-fit.`);
       }
    }
  }, [displayLibraries, userLocation, isMapReady]);

  // 🛡️ 선택된 도서관이 변경되면 지도 이동
  useEffect(() => {
    if (!selectedLibrary || !mapRef.current || !window.kakao || !window.kakao.maps) return;

    if (selectedLibrary.latitude && selectedLibrary.longitude) {
      console.log(`[LibraryMap] Panning to selected library: ${selectedLibrary.libName}`);
      const position = new window.kakao.maps.LatLng(
        selectedLibrary.latitude,
        selectedLibrary.longitude
      );
      mapRef.current.panTo(position);
      
      // 선택 시 줌 레벨 조정 (너무 멀리서 보면 잘 안보일 수 있으므로)
      if (mapRef.current.getLevel() > 5) {
          mapRef.current.setLevel(5, { animate: true });
      }
    }
  }, [selectedLibrary]);

  // 🛡️ 지도 이동 감지 (재검색 버튼 표시)
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !onSearchArea) return;

    const map = mapRef.current;
    
    // 초기 중심점 및 줌 레벨 저장
    if (!lastSearchCenterRef.current) {
        const center = map.getCenter();
        lastSearchCenterRef.current = { lat: center.getLat(), lng: center.getLng() };
        lastSearchZoomRef.current = map.getLevel();
    }

    const handleMapChange = () => {
       if (!lastSearchCenterRef.current) return;
       
       const center = map.getCenter();
       const lat = center.getLat();
       const lng = center.getLng();
       const zoom = map.getLevel();
       
       // 1. 거리 차이 (약 2km)
       const diffLat = Math.abs(lat - lastSearchCenterRef.current.lat);
       const diffLng = Math.abs(lng - lastSearchCenterRef.current.lng);
       
       // 2. 줌 레벨 차이 (1단계 이상)
       const diffZoom = Math.abs(zoom - lastSearchZoomRef.current);
       
       if (diffLat > 0.02 || diffLng > 0.02 || diffZoom >= 1) {
          setShowSearchButton(true);
       }
    };

    // 'idle' 이벤트가 편하지만 카카오맵엔 없으므로 dragend + zoom_changed 사용 (디바운싱 필요 없음, 상태값만 변경)
    window.kakao.maps.event.addListener(map, 'dragend', handleMapChange);
    window.kakao.maps.event.addListener(map, 'zoom_changed', handleMapChange);

    return () => {
        try {
            window.kakao.maps.event.removeListener(map, 'dragend', handleMapChange);
            window.kakao.maps.event.removeListener(map, 'zoom_changed', handleMapChange);
        } catch(e) {}
    }
  }, [isMapReady, onSearchArea]);

  // 📍 "이 지역에서 재검색" 핸들러
  const handleSearchCurrentArea = useCallback(() => {
    if (!mapRef.current || !window.kakao.maps.services || !onSearchArea) return;

    setIsSearching(true);
    const center = mapRef.current.getCenter();
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.coord2RegionCode(center.getLng(), center.getLat(), (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
            // 법정동/행정동 정보 중 '행정동(H)' 또는 '법정동(B)' 모두 올 수 있음.
            // 보통 API 결과 배열의 첫 번째 요소나 region_type을 확인
            // result[0]이 보통 가장 상세한 주소
            
            const item = result.find(r => r.region_type === 'H') || result[0];
            
            if (item) {
                console.log(`[LibraryMap] Reverse Geocoding: ${item.region_1depth_name} ${item.region_2depth_name}`);
                
                const internalCode = mapKakaoRegionToInternalCode(item.region_1depth_name, item.region_2depth_name);
                
                if (internalCode) {
                    console.log(`[LibraryMap] Internal Code Found: ${internalCode.code} (${internalCode.name})`);
                    
                    // onSearchArea는 async일 수도 있고 아닐 수도 있음 (HomeMapSection에서는 async)
                    Promise.resolve(onSearchArea(internalCode.code))
                    .finally(() => {
                        setIsSearching(false);
                        setShowSearchButton(false);
                        lastSearchCenterRef.current = { lat: center.getLat(), lng: center.getLng() };
                        lastSearchZoomRef.current = mapRef.current?.getLevel() || 0;
                    });
                } else {
                     console.warn(`[LibraryMap] No internal code mapped.`);
                     setIsSearching(false);
                }
            }
        } else {
            console.error('[LibraryMap] Reverse Geocoding Failed');
            setIsSearching(false);
        }
    });

  }, [onSearchArea]);

  return (
    <div className="relative w-full h-full group">
       <div ref={mapContainer} className="w-full h-full" />
       
       {/* 📍 이 지역에서 다시 검색 버튼 */}
       {showSearchButton && (
         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={handleSearchCurrentArea}
              disabled={isSearching}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-full shadow-lg border border-purple-100 hover:bg-purple-50 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span className="text-xs font-black">이 지역에서 다시 검색</span>
            </button>
         </div>
       )}
    </div>
  );
}
