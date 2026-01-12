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
  
  // 1. 휴관일 체크
  if (closedDays && closedDays !== '-') {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const currentDayName = days[day];
    
    if (closedDays.includes(currentDayName)) {
      return { status: 'CLOSED_DAY', label: '오늘 휴관일', color: 'red' };
    }
  }

  if (!operatingTime || operatingTime === '-' || operatingTime.trim() === '') {
    return { status: 'UNKNOWN', label: '정보 없음', color: 'gray' };
  }

  // 2. 운영 시간 체크
  try {
    const isWeekend = day === 0 || day === 6;
    let targetTimeStr = operatingTime;

    // 복합적인 시간 형식 (연서도서관 예: "평일 09:00~22:00, 주말 09:00~17:00") 처리
    if (operatingTime.includes('평일') || operatingTime.includes('주말') || operatingTime.includes('토') || operatingTime.includes('일')) {
      const parts = operatingTime.split(/[,/|]|\s{2,}/); // 쉼표, 슬래시, 또는 긴 공백으로 분리
      
      const weekendPart = parts.find(p => p.includes('주말') || p.includes('토') || p.includes('일'));
      const weekdayPart = parts.find(p => p.includes('평일') || p.includes('월') || p.includes('화') || p.includes('수') || p.includes('목') || p.includes('금'));
      
      if (isWeekend && weekendPart) {
        targetTimeStr = weekendPart;
      } else if (!isWeekend && weekdayPart) {
        targetTimeStr = weekdayPart;
      }
    }

    // 시간 추출 (예: 09:00 ~ 22:00)
    // 숫자가 연속으로 나오는 패턴을 더 유연하게 매칭
    const timeMatch = targetTimeStr.match(/(\d{1,2})[:시]?(\d{2})?\s*~\s*(\d{1,2})[:시]?(\d{2})?/);
    
    if (timeMatch) {
      // 시간 변환 (9:00 -> 0900, 22:00 -> 2200)
      const openHour = parseInt(timeMatch[1]);
      const openMin = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const closeHour = parseInt(timeMatch[3]);
      const closeMin = timeMatch[4] ? parseInt(timeMatch[4]) : 0;

      const openTime = openHour * 100 + openMin;
      const closeTime = closeHour * 100 + closeMin;

      if (currentTime >= openTime && currentTime < closeTime) {
        return { status: 'OPEN', label: '지금 운영 중', color: 'green' };
      } else {
        return { status: 'CLOSED', label: '지금 운영 종료', color: 'gray' };
      }
    }
  } catch (e) {
    // 에러 발생 시 로그를 남기지 않고 UNKNOWN 반환 (사용자 경험 우선)
  }

  return { status: 'UNKNOWN', label: '운영시간 확인', color: 'gray' };
}
