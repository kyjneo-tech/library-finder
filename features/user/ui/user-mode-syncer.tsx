'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { useSearchMode } from '@/features/search-mode/lib/use-search-mode';

export function UserModeSyncer() {
  const { userType, initialized } = useAuthStore();
  const { setMode } = useSearchMode();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    // Only sync once when auth is initialized and we have a userType
    if (initialized && userType && !hasSyncedRef.current) {
      if (userType === 'parent') {
        setMode('kids');
      } else {
        setMode('general');
      }
      hasSyncedRef.current = true;
    }
  }, [userType, initialized, setMode]);

  return null;
}
