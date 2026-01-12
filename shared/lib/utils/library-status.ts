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
  const now = new Date();
  const day = now.getDay(); // 0(일) ~ 6(토)
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  // 1. 휴관일 체크 (운영시간 정보가 없어도 휴관일은 판별 가능)
  if (closedDays && closedDays !== '-') {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const currentDayName = days[day];
    
    // "매주 월요일", "첫째 셋째 화요일", "토, 일" 등 다양한 패턴 체크
    if (closedDays.includes(currentDayName) || 
        (currentDayName === '일' && (closedDays.includes('매주 일') || closedDays.includes('일요일'))) ||
        (currentDayName === '토' && (closedDays.includes('매주 토') || closedDays.includes('토요일')))) {
      return { status: 'CLOSED_DAY', label: '오늘 휴관일', color: 'red' };
    }
  }

  // 운영시간 정보가 아예 없거나 '-' 인 경우 여기서 종료
  if (!operatingTime || operatingTime === '-') {
    return { status: 'UNKNOWN', label: '정보 없음', color: 'gray' };
  }

  // 2. 운영 시간 체크
  try {
    const isWeekend = day === 0 || day === 6;
    let targetTimeStr = operatingTime;

    // "평일 09:00~22:00, 주말 09:00~18:00" 같은 형태 분리
    if (operatingTime.includes('평일') || operatingTime.includes('주말') || operatingTime.includes('토') || operatingTime.includes('일')) {
      const parts = operatingTime.split(/[,/|]/);
      const weekendPart = parts.find(p => p.includes('주말') || p.includes('토요일') || p.includes('일요일') || p.includes('토,일'));
      const weekdayPart = parts.find(p => p.includes('평일') || p.includes('월~금'));
      
      if (isWeekend && weekendPart) {
        targetTimeStr = weekendPart;
      } else if (!isWeekend && weekdayPart) {
        targetTimeStr = weekdayPart;
      }
    }

    // 시간 추출 정규식 강화 (09:00, 9:00, 0900 모두 대응 시도)
    const timeMatch = targetTimeStr.match(/(\d{1,2}):?(\d{2})\s*~\s*(\d{1,2}):?(\d{2})/);
    
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