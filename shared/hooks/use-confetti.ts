'use client';

import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fireConfetti = useCallback(() => {
    // Fire confetti from center of screen
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  }, []);

  const fireFromElement = useCallback((element?: HTMLElement | null) => {
    if (!element) {
      fireConfetti();
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 60,
      spread: 55,
      origin: { x, y },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  }, []);

  return { buttonRef, fireConfetti, fireFromElement };
}
