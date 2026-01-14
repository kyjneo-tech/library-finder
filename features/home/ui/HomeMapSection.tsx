import { MapPin, Phone, Clock, Monitor, X, ExternalLink, Calendar, Navigation } from 'lucide-react';
import { LibraryMap } from '@/features/library-map/ui/LibraryMap';
import { Book } from '@/entities/book/model/types';
import { useLibrarySearch } from '@/features/library/lib/use-library-search';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { useMapStore } from '@/features/library-map/lib/use-map-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';

interface HomeMapSectionProps {
  selectedBook: Book | null;
  serviceFilter: 'all' | 'chaekium' | 'chaekbada';
  librariesWithBook: any[]; // Using any[] for now as LibraryWithBookInfo is local to useBookSearch
  userLocation: { lat: number; lng: number } | null;
  onZoomChange?: (level: number) => void;
}

export function HomeMapSection({
  selectedBook,
  serviceFilter,
  librariesWithBook,
  userLocation,
  onZoomChange
}: HomeMapSectionProps) {
  const { searchLibrariesWithBook } = useLibrarySearch();
  const { getRegionCode } = useRegionStore();
  const { selectedLibrary, setSelectedLibrary } = useMapStore();

  return (
    <div className="mx-4 mt-6 h-[400px] rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 relative group">
      <LibraryMap
        libraries={selectedBook ? librariesWithBook : undefined}
        onZoomChange={onZoomChange}
      />
      
      {/* 📍 '내 주변' 모드 뱃지 (책 미선택 시) */}
      {!selectedBook && !selectedLibrary && (
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg border border-white/50">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
               <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold leading-none mb-0.5">우리 동네</p>
              <p className="text-xs font-black text-gray-800">도서관 찾기</p>
            </div>
          </div>
        </div>
      )}

      {/* 🏢 선택된 도서관 정보 카드 (Sliding Up) */}
      <AnimatePresence>
        {selectedLibrary && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 p-4 z-20"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/50 relative overflow-hidden">
               {/* Close Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLibrary(null);
                }}
                className="absolute top-3 right-3 p-2 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-3">
                {/* Header: Name & Type */}
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-md">
                        도서관
                      </span>
                      {(selectedLibrary as any).loanAvailable !== undefined && (
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${(selectedLibrary as any).loanAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {(selectedLibrary as any).loanAvailable ? '대출가능' : '대출불가'}
                        </span>
                      )}
                   </div>
                   <h3 className="text-lg font-black text-gray-900 leading-tight pr-8">
                     {selectedLibrary.libName}
                   </h3>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                  {selectedLibrary.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                      <span className="leading-relaxed">{selectedLibrary.address}</span>
                    </div>
                  )}
                  {selectedLibrary.tel && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium">{selectedLibrary.tel}</span>
                    </div>
                  )}
                  {selectedLibrary.operatingTime && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                      <span className="leading-relaxed text-[11px]">{selectedLibrary.operatingTime}</span>
                    </div>
                  )}
                  {selectedLibrary.closed && (
                    <div className="flex items-start gap-2">
                       <Calendar className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                       <span className="text-orange-500 font-bold text-[11px]">휴관: {selectedLibrary.closed}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
                  {selectedLibrary.homepage ? (
                    <a 
                      href={selectedLibrary.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-200">
                        <Monitor className="w-3.5 h-3.5 mr-1.5" />
                        홈페이지 방문
                      </Button>
                    </a>
                  ) : (
                    <Button disabled className="flex-1 h-10 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold">
                      홈페이지 없음
                    </Button>
                  )}
                  
                  {/* 길찾기 버튼 (카카오맵 URL 스키마) - Optional but nice */}
                  {/* 
                  <a 
                     href={`https://map.kakao.com/link/to/${selectedLibrary.libName},${selectedLibrary.latitude},${selectedLibrary.longitude}`}
                     target="_blank"
                     rel="noreferrer"
                  >
                     <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-gray-200">
                        <Navigation className="w-4 h-4 text-gray-600" />
                     </Button>
                  </a> 
                  */}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
