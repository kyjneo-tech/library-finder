'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_LOCATION } from '@/shared/config/constants';

interface GeolocationState {
  latitude: number;
  longitude: number;
  loading: boolean;
  error: string | null;
}

/**
 * 사용자의 현재 위치를 가져오는 훅
 * @returns 위도, 경도, 로딩 상태, 에러
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: DEFAULT_LOCATION.lat,
    longitude: DEFAULT_LOCATION.lng,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );
  }, []);

  return state;
}
