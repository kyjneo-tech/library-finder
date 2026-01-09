"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "../lib/use-map-store";

declare global {
  interface Window {
    kakao: any;
  }
}

interface LibraryMapProps {
  libraries?: any[]; 
  onZoomOut?: () => void; // 🛡️ 줌아웃 시 범위를 확장하기 위한 콜백
}

export function LibraryMap({ libraries: externalLibraries, onZoomOut }: LibraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { userLocation, libraries: storeLibraries, setSelectedLibrary } = useMapStore();
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);

  // 🛡️ 표시할 도서관 목록 결정 (props가 있으면 우선 사용)
  const displayLibraries = externalLibraries || storeLibraries;

  // 지도 초기화
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      const options = {
        center: new window.kakao.maps.LatLng(
          userLocation?.lat || 37.566826,
          userLocation?.lng || 126.9786567
        ),
        level: 4, // 🛡️ 초기 줌 레벨을 동네 단위(4)로 설정
      };

      const map = new window.kakao.maps.Map(mapContainer.current, options);
      mapRef.current = map;

      // 🛡️ 줌 이벤트 리스너: 멀어지면 추가 탐색 유도
      window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
        const level = map.getLevel();
        if (level > 6 && onZoomOut) { // 줌이 6레벨 이상으로 멀어지면
          onZoomOut();
        }
      });
      
      setTimeout(() => { map.relayout(); }, 100);
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    }
  }, [userLocation, onZoomOut]);

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
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

    // 기존 마커/오버레이 제거
    markersRef.current.forEach(m => m.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    if (displayLibraries.length === 0) return;

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

       window.kakao.maps.event.addListener(marker, "click", () => {
         setSelectedLibrary(lib);
       });

       markersRef.current.push(marker);
       overlaysRef.current.push(overlay);
    });

    // 모든 마커가 보이도록 지도 범위 재설정
    if (hasValidPosition) {
      mapRef.current.setBounds(bounds);
    }
  }, [displayLibraries, setSelectedLibrary]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
