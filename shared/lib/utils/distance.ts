/**
 * 두 좌표 간의 거리를 계산합니다 (Haversine formula)
 * @param lat1 시작 위도
 * @param lon1 시작 경도
 * @param lat2 도착 위도
 * @param lon2 도착 경도
 * @returns 거리 (미터 단위)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 지구 반경 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 거리를 사람이 읽기 쉬운 형식으로 변환합니다
 * @param meters 거리 (미터)
 * @returns 포맷된 문자열 (예: "1.2km", "350m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
