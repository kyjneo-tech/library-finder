"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useMapStore } from "../lib/use-map-store";
import { useRegionStore } from "@/features/region-selector/lib/use-region-store";

declare global {
  interface Window {
    kakao: any;
  }
}

interface LibraryMapProps {
  libraries?: any[]; 
  onZoomOut?: () => void; // 🛡️ 줌아웃 시 범위를 확장하기 위한 콜백
  userLocation?: { lat: number; lng: number } | null; // 사용자 위치
}

export function LibraryMap({ libraries: externalLibraries, onZoomOut, userLocation: propsUserLocation }: LibraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { userLocation: storeUserLocation, libraries: storeLibraries, selectedLibrary, setSelectedLibrary } = useMapStore();
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

  // 🛡️ 사용자 위치: props > store 우선
  const userLocation = propsUserLocation ?? storeUserLocation;

  // 🛡️ 표시할 도서관 목록 결정 (props가 있으면 우선 사용)
  const displayLibraries = externalLibraries || storeLibraries;

  // 🛡️ 선택된 도서관으로 지도 이동 (리스트 클릭 시)
  useEffect(() => {
    console.log(`[LibraryMap useEffect-selectedLibrary] Triggered. selectedLibrary:`, selectedLibrary);

    if (!selectedLibrary) {
      console.log(`[LibraryMap useEffect-selectedLibrary] No selected library, skipping`);
      return;
    }

    if (!mapRef.current) {
      console.log(`[LibraryMap useEffect-selectedLibrary] Map not ready`);
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      console.log(`[LibraryMap useEffect-selectedLibrary] Kakao maps not loaded`);
      return;
    }

    // latitude/longitude를 number로 변환 (string일 수도 있음)
    const lat = typeof selectedLibrary.latitude === 'string'
      ? parseFloat(selectedLibrary.latitude)
      : selectedLibrary.latitude;
    const lng = typeof selectedLibrary.longitude === 'string'
      ? parseFloat(selectedLibrary.longitude)
      : selectedLibrary.longitude;

    console.log(`[LibraryMap useEffect-selectedLibrary] Parsed coordinates: lat=${lat}, lng=${lng}`);

    // 유효한 좌표인지 확인
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);

        // 현재 지도 중심 확인
        const currentCenter = mapRef.current.getCenter();
        console.log(`[LibraryMap useEffect-selectedLibrary] BEFORE move - Current center: (${currentCenter.getLat()}, ${currentCenter.getLng()}), Level: ${mapRef.current.getLevel()}`);

        // 줌 레벨을 먼저 설정한 후 중심 이동 (더 명확한 위치 표시)
        mapRef.current.setLevel(3); // 동네 단위로 확대 (1~14, 숫자가 작을수록 확대)
        mapRef.current.setCenter(moveLatLon); // panTo 대신 setCenter로 즉시 이동

        // 이동 후 지도 중심 확인
        const newCenter = mapRef.current.getCenter();
        console.log(`[LibraryMap useEffect-selectedLibrary] AFTER move - New center: (${newCenter.getLat()}, ${newCenter.getLng()}), Level: ${mapRef.current.getLevel()}`);

        const libName = (selectedLibrary as any).libName || (selectedLibrary as any).libraryName || 'Unknown';
        console.log(`[LibraryMap useEffect-selectedLibrary] ✅ Successfully moved to selected library: ${libName} (${lat}, ${lng})`);
    } else {
        console.warn(`[LibraryMap useEffect-selectedLibrary] ❌ Invalid coordinates for selected library:`, selectedLibrary);
    }
  }, [selectedLibrary]);

  // 🛡️ 선택된 지역 이름 조합 (좌표 데이터 의존성 제거)
  const searchAddress = useMemo(() => {
    if (!selectedRegion) return null;
    
    let address = selectedRegion.name; // 예: 충청북도
    let level = 10; // 도 단위 줌 레벨 (넓게)

    if (selectedSubRegion) {
        address += ` ${selectedSubRegion.name}`; // 예: 충청북도 청주시
        level = 8; // 시/군 단위 줌 레벨
    }

    if (selectedDistrict) {
        address += ` ${selectedDistrict.name}`; // 예: 충청북도 청주시 서원구
        level = 7; // 구 단위 줌 레벨 (적당히)
    }

    return { address, level };
  }, [selectedRegion, selectedSubRegion, selectedDistrict]);

  // 🛡️ 주소 검색을 통한 지도 이동 (Geocoding)
  useEffect(() => {
    console.log(`[LibraryMap useEffect-searchAddress] Triggered. searchAddress:`, searchAddress, `selectedLibrary:`, selectedLibrary);

    // 🛡️ CRITICAL: 도서관이 선택된 상태면 지역 검색 스킵 (도서관 위치 우선)
    if (selectedLibrary) {
      console.log(`[LibraryMap useEffect-searchAddress] Skipping - library selected`);
      return;
    }

    if (!searchAddress) {
      console.log(`[LibraryMap useEffect-searchAddress] No search address, skipping`);
      return;
    }

    if (!mapRef.current || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.log(`[LibraryMap useEffect-searchAddress] Map or services not ready`);
      return;
    }

    // 🛡️ 이미 geocoding 진행 중이면 스킵
    if (geocodingInProgressRef.current) {
      console.log(`[LibraryMap useEffect-searchAddress] Geocoding already in progress, skipping`);
      return;
    }

    geocodingInProgressRef.current = true;
    const geocoder = new window.kakao.maps.services.Geocoder();

    console.log(`[LibraryMap useEffect-searchAddress] Starting geocoding for: ${searchAddress.address}`);

    geocoder.addressSearch(searchAddress.address, (result: any, status: any) => {
        geocodingInProgressRef.current = false;

        // 🛡️ 콜백 실행 시점에 도서관이 선택되어 있으면 지도 이동 안 함
        if (selectedLibrary) {
          console.log(`[LibraryMap useEffect-searchAddress] Geocoding completed but library is now selected, ignoring result`);
          return;
        }

        if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            console.log(`[LibraryMap useEffect-searchAddress] BEFORE region move - Current center: (${mapRef.current.getCenter().getLat()}, ${mapRef.current.getCenter().getLng()})`);

            // 지도 이동 및 줌 레벨 설정
            mapRef.current.setLevel(searchAddress.level);
            mapRef.current.panTo(coords);

            console.log(`[LibraryMap useEffect-searchAddress] AFTER region move - New center should be: (${result[0].y}, ${result[0].x}), Level: ${searchAddress.level}`);
            console.log(`[LibraryMap useEffect-searchAddress] ✅ Moved to ${searchAddress.address}`);
        } else {
            console.warn(`[LibraryMap useEffect-searchAddress] ❌ Failed to find address: ${searchAddress.address}`);
        }
    });
  }, [searchAddress, selectedLibrary]);

  // 🛡️ onZoomOut을 ref로 저장하여 최신 값 참조
  const onZoomOutRef = useRef(onZoomOut);
  useEffect(() => {
    onZoomOutRef.current = onZoomOut;
  }, [onZoomOut]);

  // 지도 초기화 (🛡️ CRITICAL: 한 번만 실행되도록 의존성 배열 비움)
  useEffect(() => {
    if (!mapContainer.current) return;
    if (isMapInitializedRef.current) return; // 🛡️ 이미 초기화되었으면 스킵

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      console.log(`[LibraryMap] Initializing map with center: ${userLocation?.lat || 37.566826}, ${userLocation?.lng || 126.9786567}`);

      const options = {
        center: new window.kakao.maps.LatLng(
          userLocation?.lat || 37.566826,
          userLocation?.lng || 126.9786567
        ),
        level: 4, // 🛡️ 초기 줌 레벨을 동네 단위(4)로 설정
      };

      const map = new window.kakao.maps.Map(mapContainer.current, options);
      mapRef.current = map;
      isMapInitializedRef.current = true; // 🛡️ 초기화 완료 표시

      console.log(`[LibraryMap] Map initialized successfully`);

      // 🛡️ 줌 이벤트 리스너: 디바운싱 + 중복 호출 방지
      let zoomTimeout: NodeJS.Timeout;
      window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
        if (zoomTimeout) clearTimeout(zoomTimeout);

        zoomTimeout = setTimeout(() => {
          const level = map.getLevel();
          // 🛡️ 줌 레벨 6 초과 시 넓은 지역 검색 (같은 레벨에서 중복 호출 방지)
          if (level > 6 && level > lastZoomOutLevelRef.current && onZoomOutRef.current) {
            console.log(`[LibraryMap] Zoom level ${level} detected, triggering wide search...`);
            lastZoomOutLevelRef.current = level;
            onZoomOutRef.current();
          }
          // 줌인 시 레벨 초기화 (다시 줌아웃하면 검색 가능하도록)
          if (level <= 6) {
            lastZoomOutLevelRef.current = 0;
          }
        }, 500); // 0.5초 대기 후 실행
      });

      setTimeout(() => { map.relayout(); }, 100);
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 마커 및 오버레이 렌더링 & 지도 범위 재설정
  useEffect(() => {
    console.log(`[LibraryMap useEffect-markers] Triggered. displayLibraries.length: ${displayLibraries.length}, initialBoundsSetRef: ${initialBoundsSetRef.current}`);

    if (!mapRef.current || !window.kakao || !window.kakao.maps) {
      console.log(`[LibraryMap useEffect-markers] Map not ready`);
      return;
    }

    // 🛡️ 기존 이벤트 리스너 명시적으로 제거
    eventListenersRef.current.forEach(({ marker, listener }) => {
      try {
        window.kakao.maps.event.removeListener(marker, 'click', listener);
      } catch (e) {
        console.warn('[LibraryMap] Failed to remove listener:', e);
      }
    });
    eventListenersRef.current = [];

    // 기존 마커/오버레이 제거
    markersRef.current.forEach(m => m.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    if (displayLibraries.length === 0) {
      console.log(`[LibraryMap useEffect-markers] No libraries to display. Resetting initialBoundsSetRef`);
      initialBoundsSetRef.current = false;
      return;
    }

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasValidPosition = false;

    displayLibraries.forEach((lib) => {
       // 위경도가 없는 경우 (API 데이터 누락 등)
       // 임시적으로: 위경도가 없으면 지도에 표시 불가.
       // TODO: 실제로는 주소 -> 좌표 변환이 필요할 수 있음.
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

       // 커스텀 오버레이 컨텐츠 (대출 가능 여부 등 표시)
       let content = `<div style="padding:5px; background:white; border:1px solid #ccc; border-radius:5px; font-size:12px; font-weight:bold; white-space:nowrap;">${lib.libName || lib.libraryName}</div>`;

       if (lib.loanAvailable !== undefined) {
          const color = lib.loanAvailable ? "green" : "red";
          const text = lib.loanAvailable ? "대출가능" : "대출중";
           content = `<div style="padding:8px; background:white; border:1px solid ${color}; color:${color}; border-radius:12px; font-size:11px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:flex; flex-direction:column; align-items:center; gap:4px; min-width:80px;">
             <span>${text}</span>
             ${lib.homepage ? `<a href="${lib.homepage}" target="_blank" rel="noopener noreferrer" style="color:#666; text-decoration:none; font-size:10px; border:1px solid #eee; padding:2px 6px; border-radius:4px; background:#f8f9fa;">홈페이지 ></a>` : ''}
           </div>`;
       }

       const overlay = new window.kakao.maps.CustomOverlay({
         content: content,
         position: position,
         yAnchor: 2.2, // 마커 위쪽으로 띄움
         map: mapRef.current,
       });

       // 🛡️ 디바운싱이 적용된 클릭 핸들러
       const clickHandler = () => {
         const now = Date.now();
         // 300ms 이내의 중복 클릭 무시 (디바운싱)
         if (now - lastClickTimeRef.current < 300) {
           console.log(`[LibraryMap] Debounced click ignored for: ${lib.libName || lib.libraryName}`);
           return;
         }
         lastClickTimeRef.current = now;
         console.log(`[LibraryMap] Marker clicked: ${lib.libName || lib.libraryName}`);
         setSelectedLibrary(lib);
       };

       // 이벤트 리스너 등록 및 참조 저장
       window.kakao.maps.event.addListener(marker, "click", clickHandler);
       eventListenersRef.current.push({ marker, listener: clickHandler });

       markersRef.current.push(marker);
       overlaysRef.current.push(overlay);
    });

    // 🛡️ 모든 마커가 보이도록 지도 범위 재설정
    // 단, 최초 1회만 실행 (이후에는 사용자가 선택한 도서관 위치를 유지)
    if (hasValidPosition && !initialBoundsSetRef.current) {
      console.log(`[LibraryMap useEffect-markers] Setting bounds for ${displayLibraries.length} libraries`);
      console.log(`[LibraryMap useEffect-markers] BEFORE setBounds - Current center: (${mapRef.current.getCenter().getLat()}, ${mapRef.current.getCenter().getLng()})`);

      mapRef.current.setBounds(bounds);
      initialBoundsSetRef.current = true;

      // setBounds 후 중심 확인 (비동기일 수 있으므로 setTimeout)
      setTimeout(() => {
        const newCenter = mapRef.current.getCenter();
        console.log(`[LibraryMap useEffect-markers] AFTER setBounds - New center: (${newCenter.getLat()}, ${newCenter.getLng()}), Level: ${mapRef.current.getLevel()}`);
      }, 100);

      console.log(`[LibraryMap useEffect-markers] ✅ Initial bounds set for ${displayLibraries.length} libraries`);
    } else if (!hasValidPosition) {
      console.log(`[LibraryMap useEffect-markers] ⚠️ No valid positions found`);
    } else if (initialBoundsSetRef.current) {
      console.log(`[LibraryMap useEffect-markers] ⏭️ Skipping setBounds (already set)`);
    }
  }, [displayLibraries]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
