'use client';

import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { usePendingActionStore } from '@/shared/lib/stores/use-pending-action-store';

export function useRegionValidation() {
  const { getRegionCode } = useRegionStore();
  const { openRegionModal, setPendingAction } = usePendingActionStore();

  /**
   * 지역 선택 여부를 검증합니다.
   * @returns {boolean} 검증 통과 여부 (true: 통과, false: 실패)
   */
  const validateRegion = (): boolean => {
    const regionCode = getRegionCode();
    return !!regionCode;
  };

  /**
   * 지역이 없을 때 모달을 표시합니다.
   * @param pendingAction 지역 선택 후 실행할 액션 (선택)
   */
  const requireRegion = (pendingAction?: { type: string; payload: any }) => {
    if (pendingAction) {
      openRegionModal(pendingAction as any);
    } else {
      openRegionModal();
    }
  };

  /**
   * 함수 실행 전 지역 선택 여부를 자동으로 검증하는 HOC(Higher Order Function)입니다.
   * 지역이 없으면 모달을 표시하고, 콜백과 인자를 저장합니다.
   * @param callback 검증 통과 시 실행할 함수
   * @param actionType 저장할 액션 타입 (기본: 'generic')
   */
  const withRegionCheck = <T extends (...args: any[]) => any>(
    callback: T,
    actionType: string = 'generic'
  ) => {
    return (...args: Parameters<T>): void => {
      if (validateRegion()) {
        callback(...args);
      } else {
        // 인자가 있으면 첫 번째 인자를 payload로 저장
        const payload = args.length > 0 ? args[0] : null;
        openRegionModal({ type: actionType, payload } as any);
      }
    };
  };

  return { validateRegion, requireRegion, withRegionCheck };
}

