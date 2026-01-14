'use client';

import { useLoadingStore } from '@/shared/lib/stores/use-loading-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function GlobalLoadingOverlay() {
  const { isLoading, loadingMessage } = useLoadingStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 mx-4 max-w-xs"
          >
            {/* 애니메이션 로더 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              {/* 펄스 이펙트 */}
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-400/20 animate-ping" />
            </div>
            
            {/* 로딩 메시지 */}
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800">
                {loadingMessage || '잠시만 기다려주세요...'}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                데이터를 불러오고 있어요
              </p>
            </div>
            
            {/* 프로그레스 바 (시각적 효과) */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
