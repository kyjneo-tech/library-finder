import { z } from 'zod';

/**
 * 사용자 위치 정보
 */
export const UserLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  timestamp: z.number().optional(),
});

export type UserLocation = z.infer<typeof UserLocationSchema>;

/**
 * 지역 코드 정보
 */
export interface RegionCode {
  code: string;
  name: string;
  detailCodes?: { code: string; name: string }[];
}

/**
 * 거리 정보
 */
export interface Distance {
  meters: number;
  formatted: string; // "1.2km" 형식
}
