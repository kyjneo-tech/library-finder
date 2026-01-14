'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { useBottomSheet } from '../lib/use-bottom-sheet';
import { cn } from '@/shared/lib/cn';

interface BottomSheetProps {
  children: ReactNode;
  className?: string;
}

const SHEET_HEIGHTS = {
  min: '40vh',
  mid: '70vh',
  max: '95vh',
} as const;

export function BottomSheet({ children, className }: BottomSheetProps) {
  const { height, setHeight, isOpen } = useBottomSheet();
  const y = useMotionValue(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      // 아래로 스와이프
      if (height === 'max') setHeight('mid');
      else if (height === 'mid') setHeight('min');
    } else if (velocity < -500 || offset < -100) {
      // 위로 스와이프
      if (height === 'min') setHeight('mid');
      else if (height === 'mid') setHeight('max');
    }
  };

  useEffect(() => {
    y.set(0);
  }, [height, y]);

  if (!isOpen) return null;

  return (
    <motion.div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl border-t',
        className
      )}
      style={{
        height: SHEET_HEIGHTS[height],
        y,
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Drag Handle */}
      <div className="w-full flex justify-center pt-3 pb-2">
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto pb-6 px-4">{children}</div>
    </motion.div>
  );
}
