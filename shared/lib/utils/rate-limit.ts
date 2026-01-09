/**
 * 간단한 메모리 기반 Rate Limiter
 * 클라이언트 IP별로 요청 횟수를 제한합니다.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// 주기적으로 만료된 레코드 정리 (메모리 누수 방지)
const CLEANUP_INTERVAL = 60000; // 1분마다
let lastCleanup = Date.now();

function cleanupExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

/**
 * Rate Limit 체크
 * @param ip 클라이언트 IP
 * @param limit 윈도우당 최대 요청 수 (기본: 100)
 * @param windowMs 윈도우 시간 (기본: 60초)
 * @returns 요청 허용 여부
 */
export function checkRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  cleanupExpiredRecords();
  
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  // 새 레코드 또는 만료된 레코드
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  // 제한 초과
  if (record.count >= limit) {
    return false;
  }
  
  // 카운트 증가
  record.count++;
  return true;
}

/**
 * 남은 요청 수 조회
 */
export function getRemainingRequests(ip: string, limit: number = 100): number {
  const record = rateLimitMap.get(ip);
  if (!record || Date.now() > record.resetTime) {
    return limit;
  }
  return Math.max(0, limit - record.count);
}
