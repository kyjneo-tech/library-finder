'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

interface KidsModeBannerProps {
  onClick: () => void;
}

export function KidsModeBanner({ onClick }: KidsModeBannerProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="mx-4 mt-6 mb-2 cursor-pointer relative group"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-2xl blur opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 p-5 rounded-2xl shadow-xl flex items-center justify-between overflow-hidden">
        
        {/* 장식용 배경 원 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="flex flex-col gap-1 z-10">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
             <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </span>
            우리 아이 딱 맞는 책 찾기
          </h3>
          <div className="text-xs font-medium text-purple-100 pl-1 leading-relaxed">
            <span className="inline-block bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/20 mr-1.5 align-middle whitespace-nowrap">
              0~6세 맞춤
            </span>
            <span className="align-middle break-keep">
              취향 분석 + 내 주변 도서관 재고까지 한 번에!
            </span>
          </div>
        </div>

        <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-white/30 transition-colors z-10">
          <Search className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
