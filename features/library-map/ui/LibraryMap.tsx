'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useMapStore } from '../lib/use-map-store';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';

declare global {
  interface Window {
    kakao: any;
  }
}

interface LibraryMapProps {
  libraries?: any[];
  onZoomChange?: (level: number) => void; // 🛡️ 줌 레벨 변경 콜백
  userLocation?: { lat: number; lng: number } | null; // 사용자 위치
}

export function LibraryMap({
  libraries: externalLibraries,
  onZoomChange,
  userLocation: propsUserLocation,
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

  // 🛡️ 사용자 위치: props > store 우선
  const userLocation = propsUserLocation ?? storeUserLocation;

  // 🛡️ 표시할 도서관 목록 결정 (props가 있으면 우선 사용)
  const displayLibraries = externalLibraries || storeLibraries;

  // 🔍 DEBUG: 데이터 흐름 추적
  console.log(`[LibraryMap] 📊 Data Flow Debug:`, {
    externalLibraries: externalLibraries?.length ?? 'undefined',
    storeLibraries: storeLibraries?.length ?? 0,
    displayLibraries: displayLibraries?.length ?? 0,
    selectedRegion: selectedRegion?.name,
    selectedSubRegion: selectedSubRegion?.name,
    selectedDistrict: selectedDistrict?.name,
  });

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

      console.log(
        `[LibraryMap] Initializing map with center: ${userLocation?.lat || 37.566826}, ${userLocation?.lng || 126.9786567}`
      );

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

      setTimeout(() => {
        map.relayout();
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

  // 마커 및 오버레이 렌더링 & 지도 범위 재설정
  useEffect(() => {
    console.log(
      `[LibraryMap useEffect-markers] Triggered. displayLibraries.length: ${displayLibraries.length}, initialBoundsSetRef: ${initialBoundsSetRef.current}`
    );

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
    markersRef.current.forEach((m) => m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    if (displayLibraries.length === 0) {
      console.log(
        `[LibraryMap useEffect-markers] No libraries to display. Resetting initialBoundsSetRef`
      );
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
        yAnchor: 2.2, // 마커 위쪽으로 띄움
        map: mapRef.current,
      });

      // 🛡️ 디바운싱이 적용된 클릭 핸들러
      const clickHandler = () => {
        const now = Date.now();
        // 300ms 이내의 중복 클릭 무시 (디바운싱)
        if (now - lastClickTimeRef.current < 300) {
          console.log(
            `[LibraryMap] Debounced click ignored for: ${lib.libName || lib.libraryName}`
          );
          return;
        }
        lastClickTimeRef.current = now;
        console.log(`[LibraryMap] Marker clicked: ${lib.libName || lib.libraryName}`);
        setSelectedLibrary(lib);
      };

      // 이벤트 리스너 등록 및 참조 저장
      window.kakao.maps.event.addListener(marker, 'click', clickHandler);
      eventListenersRef.current.push({ marker, listener: clickHandler });

      markersRef.current.push(marker);
      overlaysRef.current.push(overlay);
    });

    // 🛡️ 모든 마커가 보이도록 지도 범위 재설정
    // 단, 최초 1회만 실행 (이후에는 사용자가 선택한 도서관 위치를 유지)
    if (hasValidPosition && !initialBoundsSetRef.current) {
      console.log(
        `[LibraryMap useEffect-markers] Setting bounds for ${displayLibraries.length} libraries`
      );
      console.log(
        `[LibraryMap useEffect-markers] BEFORE setBounds - Current center: (${mapRef.current.getCenter().getLat()}, ${mapRef.current.getCenter().getLng()})`
      );

      mapRef.current.setBounds(bounds);
      initialBoundsSetRef.current = true;

      // setBounds 후 중심 확인 (비동기일 수 있으므로 setTimeout)
      setTimeout(() => {
        const newCenter = mapRef.current.getCenter();
        console.log(
          `[LibraryMap useEffect-markers] AFTER setBounds - New center: (${newCenter.getLat()}, ${newCenter.getLng()}), Level: ${mapRef.current.getLevel()}`
        );
      }, 100);

      console.log(
        `[LibraryMap useEffect-markers] ✅ Initial bounds set for ${displayLibraries.length} libraries`
      );
    } else if (!hasValidPosition) {
      console.log(`[LibraryMap useEffect-markers] ⚠️ No valid positions found`);
    } else if (initialBoundsSetRef.current) {
      console.log(`[LibraryMap useEffect-markers] ⏭️ Skipping setBounds (already set)`);
    }
  }, [displayLibraries]);

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

  return <div ref={mapContainer} className="w-full h-full" />;
}
