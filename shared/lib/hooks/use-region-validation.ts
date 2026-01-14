'use client';

import { useRegionStore } from '@/features/region-selector/lib/use-region-store';

export function useRegionValidation() {
  const { getRegionCode } = useRegionStore();

  /**
   * 지역 선택 여부를 검증하고, 선택되지 않았을 경우 알림을 표시합니다.
   * @returns {boolean} 검증 통과 여부 (true: 통과, false: 실패)
   */
  const validateRegion = (): boolean => {
    const regionCode = getRegionCode();
    if (!regionCode) {
      alert('우리 동네 맞춤 정보를 위해\n지역을 먼저 선택해주세요! 🗺️');
      return false;
    }
    return true;
  };

  /**
   * 함수 실행 전 지역 선택 여부를 자동으로 검증하는 HOC(Higher Order Function)입니다.
   * @param callback 검증 통과 시 실행할 함수
   */
  const withRegionCheck = <T extends (...args: any[]) => any>(callback: T) => {
    return (...args: Parameters<T>): void => {
      if (validateRegion()) {
        callback(...args);
      }
    };
  };

  return { validateRegion, withRegionCheck };
}
