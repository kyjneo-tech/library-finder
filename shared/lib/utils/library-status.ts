/**
 * 도서관 운영 시간을 분석하여 현재 운영 상태를 반환합니다.
 */

export type OperatingStatus = 'OPEN' | 'CLOSED' | 'CLOSED_DAY' | 'UNKNOWN';

interface StatusResult {
  status: OperatingStatus;
  label: string;
  color: string;
}

export function getOperatingStatus(operatingTime?: string, closedDays?: string): StatusResult {
  if (!operatingTime) {
    return { status: 'UNKNOWN', label: '정보 없음', color: 'gray' };
  }

  const now = new Date();
  const day = now.getDay(); // 0(일) ~ 6(토)
  const currentTime = now.getHours() * 100 + now.getMinutes();

  // 1. 휴관일 체크
  if (closedDays) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const currentDayName = days[day];
    
    // "매주 월요일", "첫째 셋째 화요일" 등 분석
    if (closedDays.includes(currentDayName)) {
      return { status: 'CLOSED_DAY', label: '오늘 휴관일', color: 'red' };
    }
  }

  // 2. 운영 시간 체크 (예: "09:00~22:00" 또는 "평일 09:00~22:00, 주말 09:00~18:00")
  try {
    // 가장 단순한 형태인 "HH:mm~HH:mm" 검색
    const timeMatch = operatingTime.match(/(\d{2}):(\d{2})\s*~\s*(\d{2}):(\d{2})/);
    
    if (timeMatch) {
      const openTime = parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2]);
      const closeTime = parseInt(timeMatch[3]) * 100 + parseInt(timeMatch[4]);

      if (currentTime >= openTime && currentTime < closeTime) {
        return { status: 'OPEN', label: '지금 운영 중', color: 'green' };
      } else {
        return { status: 'CLOSED', label: '지금 운영 종료', color: 'gray' };
      }
    }
  } catch (e) {
    console.error("Error parsing operating time:", e);
  }

  return { status: 'UNKNOWN', label: '운영시간 확인', color: 'gray' };
}
