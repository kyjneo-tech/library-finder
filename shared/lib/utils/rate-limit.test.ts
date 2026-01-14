import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getRemainingRequests } from './rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset any state if necessary. 
    // Since rateLimitMap is module-level, we might need a way to clear it 
    // or just use different IPs for each test.
    vi.useFakeTimers();
  });

  it('should allow requests within limit', () => {
    const ip = '1.1.1.1';
    expect(checkRateLimit(ip, 2, 1000)).toBe(true);
    expect(checkRateLimit(ip, 2, 1000)).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    const ip = '2.2.2.2';
    expect(checkRateLimit(ip, 1, 1000)).toBe(true);
    expect(checkRateLimit(ip, 1, 1000)).toBe(false);
  });

  it('should reset after windowMs', () => {
    const ip = '3.3.3.3';
    expect(checkRateLimit(ip, 1, 1000)).toBe(true);
    expect(checkRateLimit(ip, 1, 1000)).toBe(false);

    vi.advanceTimersByTime(1001);
    
    expect(checkRateLimit(ip, 1, 1000)).toBe(true);
  });
  
  it('should return correct remaining requests', () => {
      const ip = '4.4.4.4';
      const limit = 5;
      expect(getRemainingRequests(ip, limit)).toBe(limit);
      
      checkRateLimit(ip, limit, 1000); // 1st request
      expect(getRemainingRequests(ip, limit)).toBe(limit - 1);
  });
});
