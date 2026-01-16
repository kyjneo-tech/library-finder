'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { usePendingActionStore } from '@/shared/lib/stores/use-pending-action-store';
import { RegionSelector } from '@/features/region-selector/ui/region-selector';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';

interface RegionRequiredModalProps {
  onRegionSelected?: () => void;
}

export function RegionRequiredModal({ onRegionSelected }: RegionRequiredModalProps) {
  const { showRegionModal, closeRegionModal } = usePendingActionStore();
  const { getRegionCode } = useRegionStore();

  const handleConfirm = () => {
    const regionCode = getRegionCode();
    if (regionCode) {
      closeRegionModal();
      onRegionSelected?.();
    }
  };

  return (
    <AnimatePresence>
      {showRegionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeRegionModal}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-purple-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    어느 동네에서 찾을까요?
                  </h2>
                  <p className="text-sm text-gray-500">
                    지역을 선택하면 바로 찾아드려요
                  </p>
                </div>
              </div>
              <button
                onClick={closeRegionModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Region Selector */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <RegionSelector />
            </div>

            {/* Actions */}
            <Button
              onClick={handleConfirm}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
            >
              이 지역에서 찾기
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
