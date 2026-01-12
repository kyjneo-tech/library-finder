"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Search, MapPin, BookOpen, Library as LibraryIcon, CheckCircle2, XCircle, X, ChevronRight, TrendingUp, Heart, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoritesStore } from "@/features/favorites/lib/use-favorites-store";
import { RegionSelector } from "@/features/region-selector/ui/region-selector";
import { useRegionStore } from "@/features/region-selector/lib/use-region-store";
import { useBookSearch } from "@/features/book-search/lib/use-book-search";
import { useMapStore } from "@/features/library-map/lib/use-map-store";
import { useSearchMode } from "@/features/search-mode/lib/use-search-mode";
import { AgeFilter } from "@/features/kids-mode/ui/age-filter";
import { KidsRecommendations } from "@/features/kids-mode/ui/kids-recommendations";
import { KidsCategories } from "@/features/kids-mode/ui/kids-categories";
import { SituationCategories } from "@/features/kids-mode/ui/situation-categories";
import { LocalPopularBooks } from "@/features/kids-mode/ui/local-popular-books";
import { SmartFinderModal } from "@/features/kids-mode/ui/smart-finder-modal";
import { MonthlyTrends } from "@/features/kids-mode/ui/monthly-trends";
import { useCategoryTab } from "@/features/kids-mode/lib/use-category-tab";
import { LibraryMap } from "@/features/library-map/ui/LibraryMap";
import { FamilyCategories } from "@/features/recommendations/ui/family-categories";
import { FamilyPopularBooks } from "@/features/recommendations/ui/family-popular-books";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";
import { checkLibraryServices } from "@/shared/lib/utils/library-services";
import { getOperatingStatus } from "@/shared/lib/utils/library-status";
import { formatDistance } from "@/shared/lib/utils/distance";
import { sanitizeHTML } from "@/shared/lib/utils/sanitize";
import { fadeInDown, fadeInUp, hoverScale, buttonPress, staggerContainer, staggerItem } from "@/shared/lib/animations/variants";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { Book } from "@/entities/book/model/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSmartFinder, setShowSmartFinder] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'chaekium' | 'chaekbada'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const { mode, setMode, getSearchConfig } = useSearchMode();
  const config = getSearchConfig();
  const { activeTab, setActiveTab } = useCategoryTab();

  useEffect(() => {
    if (mounted) {
      setSearchQuery("");
      setShowSearchResults(false);
      clearLibraries();
    }
  }, [mode, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { getRegionCode, selectedRegion, selectedSubRegion, selectedDistrict, reset: resetRegion } = useRegionStore();
  const {
    books,
    loading,
    selectedBook,
    librariesWithBook,
    librariesLoading,
    searchBooks,
    selectBook,
    searchLibrariesWithBook,
    deepScan,
    clearLibraries,
    searchByKdc,
    setBooks,
    setUserLocation: setBookSearchUserLocation,
    mergeLibraries,
  } = useBookSearch();
  const { loadLibraries, userLocation: mapUserLocation, setSelectedLibrary } = useMapStore();

  // 🛡️ 사용자 위치 가져오기
  useEffect(() => {
    if (mounted && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setBookSearchUserLocation(loc);
          console.log(`[HomePage] User location: ${loc.lat}, ${loc.lng}`);
        },
        (error) => {
          console.warn("[HomePage] 위치 정보를 가져올 수 없습니다:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [mounted, setBookSearchUserLocation]);

  // 🛡️ 검색 결과 모달이 열릴 때 스크롤 맨 위로 초기화
  useEffect(() => {
    if (showSearchResults && searchResultsRef.current) {
      searchResultsRef.current.scrollTop = 0;
    }
  }, [showSearchResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await searchBooks({ query: searchQuery });
    setShowSearchResults(true);
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery(""); // 검색어 초기화
    // 🛡️ 모달을 닫을 때 페이지 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySearch = async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    const regionCode = getRegionCode(); 
    if (kdc) {
      const data = await bookRepository.getPopularBooks({
        kdc,
        region: regionCode || undefined,
        pageSize: 20
      });
      if (data && data.length > 0) {
        setBooks(data);
        setShowSearchResults(true);
        return;
      }
    }
    await searchBooks({ query: keyword });
    setShowSearchResults(true);
  };

  const handleSmartSearch = async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    if (kdc) {
      await searchByKdc(kdc, keyword);
    } else {
      await searchBooks({ query: keyword });
    }
    setShowSearchResults(true);
  };

  const [reviews, setReviews] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any>(null);

  const handleBookSelect = async (book: Book) => {
    selectBook(book);
    setShowSearchResults(false);
    const [reviewData, analysisData] = await Promise.all([
      bookRepository.getBlogReviews(book.title),
      bookRepository.getUsageAnalysis(book.isbn13 || book.isbn)
    ]);
    setReviews(reviewData);
    setUsageData(analysisData);

    const regionCode = getRegionCode();
    if (!regionCode) {
      alert("먼저 검색할 지역을 선택해주세요!");
      return;
    }
    const targetIsbn = book.isbn13 || book.isbn;
    if (targetIsbn) {
      // 🛡️ 사용자 위치 전달하여 거리 기반 정렬
      await searchLibrariesWithBook(targetIsbn, regionCode, false, userLocation);
    }
  };

  const handleDeepScan = async () => {
    if (!selectedBook) return;
    const regionCode = getRegionCode();
    if (!regionCode) {
        alert("지역을 선택해주세요.");
        return;
    }
    const targetIsbn = selectedBook.isbn13 || selectedBook.isbn;
    if (targetIsbn) {
      await deepScan(targetIsbn, regionCode);
    }
  };

  // 🛡️ 필터링된 도서관 목록 계산
  const filteredLibraries = useMemo(() => {
    return librariesWithBook.filter(lib => {
      const services = checkLibraryServices(lib.libName);
      if (serviceFilter === 'chaekium') return services.isChaekium;
      if (serviceFilter === 'chaekbada') return services.isChaekbada;
      return true;
    });
  }, [librariesWithBook, serviceFilter]);

  // 🛡️ 지역 변경 시 지도용 도서관 목록 로드
  useEffect(() => {
    const regionCode = getRegionCode();
    if (regionCode && mounted) {
      console.log(`[HomePage] Loading libraries for map: ${regionCode}`);
      loadLibraries(regionCode);
    }
  }, [selectedRegion?.code, selectedSubRegion?.code, selectedDistrict?.code, mounted, loadLibraries]);

  // 🛡️ 지역 변경 시 선택된 책의 도서관 재검색
  useEffect(() => {
    if (!selectedBook || !mounted) return;

    const regionCode = getRegionCode();
    if (!regionCode) {
      console.log(`[HomePage] No region selected, skipping library search`);
      return;
    }

    const targetIsbn = selectedBook.isbn13 || selectedBook.isbn;
    if (targetIsbn) {
      // 🛡️ serviceFilter에 따라 검색 범위 결정
      // 내 주변(all): false (좁은 범위 - 구/시 단위)
      // 책이음/책바다: true (넓은 범위 - 광역시도 단위)
      const isWideSearch = serviceFilter === 'chaekium' || serviceFilter === 'chaekbada';
      console.log(`[HomePage] Region changed, re-searching libraries for: ${selectedBook.title}, wide: ${isWideSearch}, filter: ${serviceFilter}`);
      searchLibrariesWithBook(targetIsbn, regionCode, isWideSearch, userLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion?.code, selectedSubRegion?.code, selectedDistrict?.code, selectedBook, mounted, serviceFilter]);

  const { addLibrary, removeLibrary, isLibraryFavorite, addBook, removeBook, isBookFavorite, favoriteLibraries, favoriteBooks } = useFavoritesStore();

  const toggleLibraryFavorite = (e: React.MouseEvent, lib: any) => {
    e.stopPropagation();
    if (isLibraryFavorite(lib.libCode)) {
      removeLibrary(lib.libCode);
    } else {
      addLibrary(lib);
    }
  };

  const toggleBookFavorite = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    const isbn = book.isbn13 || book.isbn;
    if (isBookFavorite(isbn)) {
      removeBook(isbn);
    } else {
      addBook(book);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-soft relative overflow-hidden">
      {/* ✨ 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-wisdom-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-warmth-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.header
        className="sticky top-0 z-30 glass border-b border-white/50 shadow-premium"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 relative">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={() => {
                clearLibraries();
                setShowSearchResults(false);
                setSearchQuery("");
                resetRegion();
              }}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-purple rounded-2xl flex items-center justify-center shadow-glow-purple relative overflow-hidden"
                animate={{
                  boxShadow: [
                    "0 8px 32px rgba(168, 85, 247, 0.25)",
                    "0 8px 32px rgba(168, 85, 247, 0.4)",
                    "0 8px 32px rgba(168, 85, 247, 0.25)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <LibraryIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-wisdom-600 to-warmth-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                  우리 가족 도서관
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 hidden sm:block">
                  아이부터 할머니까지, 모두의 책방
                </p>
              </div>
            </motion.button>
            <div className="flex bg-white/60 backdrop-blur-lg rounded-2xl p-1 border border-wisdom-100/50 shrink-0 shadow-sm">
              <motion.button
                onClick={() => setMode('kids')}
                className={cn(
                  "px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative overflow-hidden",
                  mode === 'kids'
                    ? "bg-gradient-hero text-white shadow-glow-warmth"
                    : "text-gray-600 hover:text-warmth-600"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === 'kids' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">🧸 아이책</span>
              </motion.button>
              <motion.button
                onClick={() => setMode('general')}
                className={cn(
                  "px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative overflow-hidden",
                  mode === 'general'
                    ? "bg-gradient-purple text-white shadow-glow-purple"
                    : "text-gray-600 hover:text-wisdom-600"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === 'general' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">👨‍👩‍👧‍👦 가족</span>
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            className="bg-white/50 rounded-2xl p-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RegionSelector />
          </motion.div>
          <motion.form
            onSubmit={handleSearch}
            className="relative group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              </motion.div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={config.placeholder}
                className="pl-12 pr-24 h-14 rounded-2xl border-2 border-gray-100 bg-white shadow-md focus:border-purple-200 focus:ring-purple-100 text-base font-medium transition-all"
              />
              <motion.div 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="h-10 px-5 rounded-xl bg-gradient-purple text-white text-sm font-bold shadow-glow-purple"
                >
                  {loading ? "찾는 중..." : "찾기"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
          {mode === 'kids' && <AgeFilter />}
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto pb-20 relative z-10">
        {/* 💖 내 찜 목록 섹션 */}
        {(favoriteLibraries.length > 0 || favoriteBooks.length > 0) && !selectedBook && !showSearchResults && (
          <motion.section 
            className="mx-4 mt-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span>나의 찜 목록</span>
              </h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
              {/* 찜한 도서관 */}
              {favoriteLibraries.map((lib) => (
                <motion.button
                  key={lib.libCode}
                  onClick={() => {
                    // 지도 위치 이동 및 해당 도서관 정보 로드 로직 (필요시 추가)
                    setSelectedLibrary(lib);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="flex-shrink-0 w-40 p-4 bg-white rounded-2xl border border-purple-100 shadow-sm text-left hover:border-purple-300 transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-2">
                    <LibraryIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs font-black text-gray-900 line-clamp-2 leading-tight">{lib.libName}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">도서관 바로가기</p>
                </motion.button>
              ))}

              {/* 찜한 책 */}
              {favoriteBooks.map((book) => (
                <motion.button
                  key={book.isbn13 || book.isbn}
                  onClick={() => handleBookSelect(book)}
                  className="flex-shrink-0 w-40 p-4 bg-white rounded-2xl border border-orange-100 shadow-sm text-left hover:border-orange-300 transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mb-2">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-xs font-black text-gray-900 line-clamp-2 leading-tight">{book.title}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">{book.author}</p>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {selectedBook && (
          <div className="mx-4 mt-6 p-6 bg-white rounded-[2rem] border-2 border-purple-50 shadow-xl shadow-purple-100/50 relative transition-all animate-in zoom-in-95 duration-300">
            <button onClick={clearLibraries} className="absolute -top-2 -right-2 p-2 bg-white text-gray-400 hover:text-gray-600 shadow-lg border border-gray-100 rounded-full transition-all hover:rotate-90"><X className="w-5 h-5" /></button>
            <div className="flex gap-6 mb-6">
              {selectedBook.bookImageURL ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-200 rounded-2xl rotate-3 scale-95 opacity-50 group-hover:rotate-6 transition-transform" />
                  <img src={selectedBook.bookImageURL} alt={selectedBook.title} className="relative w-28 h-40 object-cover rounded-2xl shadow-lg shrink-0" />
                </div>
              ) : (
                <div className="w-28 h-40 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0 border-2 border-dashed border-purple-200"><BookOpen className="w-12 h-12 text-purple-200" /></div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-2">
                   {selectedBook.className && <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-md">{selectedBook.className}</span>}
                   {selectedBook.loanCnt && <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-md">누적 대출 {selectedBook.loanCnt.toLocaleString()}회</span>}
                </div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="font-extrabold text-2xl text-gray-900 leading-tight line-clamp-2">{selectedBook.title}</h3>
                  <motion.button
                    onClick={(e) => toggleBookFavorite(e, selectedBook)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "p-3 rounded-2xl border-2 transition-all shrink-0",
                      isBookFavorite(selectedBook.isbn13 || selectedBook.isbn)
                        ? "bg-purple-100 border-purple-200 text-purple-600"
                        : "bg-gray-50 border-gray-100 text-gray-400 hover:border-purple-200"
                    )}
                  >
                    <Bookmark className={cn("w-6 h-6", isBookFavorite(selectedBook.isbn13 || selectedBook.isbn) && "fill-current")} />
                  </motion.button>
                </div>
                <p className="text-base font-bold text-purple-600 mb-2">{selectedBook.author}</p>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md">{selectedBook.publisher}</span>
                  {selectedBook.publishYear && <span className="bg-gray-100 px-2 py-0.5 rounded-md">{selectedBook.publishYear}년</span>}
                </div>
              </div>
            </div>
            {selectedBook.description && (
              <div className="mt-4 p-5 bg-purple-50/50 rounded-2xl border border-purple-100/30">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-3 px-1">줄거리 미리보기</h4>
                <p className="text-[15px] text-gray-800 leading-[1.8] font-medium tracking-tight">{selectedBook.description}</p>
              </div>
            )}
            {usageData?.loanGrps && usageData.loanGrps.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">이 책, 누가 좋아할까요?</h4>
                <div className="grid grid-cols-3 gap-2">
                  {usageData.loanGrps.slice(0, 3).map((grp: any, i: number) => {
                    const gender = grp.gender === '0' ? '남성' : '여성';
                    const age = grp.age ? `${grp.age}대` : '';
                    const ranking = grp.ranking ? `${grp.ranking}위` : '';
                    
                    if (!age && !ranking) return null;

                    return (
                      <div key={i} className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mb-1 ${grp.gender === '0' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                          {gender} {age}
                        </span>
                        <p className="text-sm font-black text-gray-800">{ranking}</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">대출 인기</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {reviews.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">먼저 읽어본 사람들의 이야기</h4>
                <div className="space-y-3">
                  {reviews.map((rev, i) => (
                    <a key={i} href={rev.link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 transition-all shadow-sm group">
                      <h5 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors" dangerouslySetInnerHTML={{ __html: sanitizeHTML(rev.title) }} />
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHTML(rev.description) }} />
                      <div className="mt-2 text-[10px] text-purple-400 font-bold">블로그 리뷰 보기 &gt;</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mx-4 mt-6 h-[350px] rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 relative">
          <LibraryMap
            libraries={selectedBook ? filteredLibraries : undefined}
            onZoomOut={async () => {
                // 🛡️ "내 주변"일 때는 줌아웃해도 확장 검색 안 함
                if (serviceFilter === 'all') {
                  console.log(`[HomePage] Zoom out ignored - "내 주변" mode`);
                  return;
                }

                // 🛡️ 책이음/책바다일 때만 줌아웃으로 확장 검색
                const regionCode = getRegionCode();
                const targetIsbn = selectedBook?.isbn13 || selectedBook?.isbn;
                if (targetIsbn && regionCode && regionCode.length === 5) {
                    console.log(`[HomePage] Zoom out - expanding search for ${serviceFilter}`);
                    // 줌아웃 시 광역시도 단위로 확장
                    await searchLibrariesWithBook(targetIsbn, regionCode, true, userLocation);
                }
            }}
          />
          {!selectedBook && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent flex items-end p-6">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-gray-700">우리 동네 도서관 위치예요</span>
              </div>
            </div>
          )}
        </div>

        {selectedBook && (
          <div className="mx-4 mt-8 mb-6">
            <div className="flex flex-col gap-6 mt-8 mb-6 px-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg"><LibraryIcon className="w-6 h-6 text-green-600" /></div>
                  <span>어떻게 빌릴까요?</span>
                </h2>
              </div>

              <div className="flex bg-gray-100/80 p-1.5 rounded-[1.5rem] gap-1">
                <button onClick={async () => {
                    setServiceFilter('all');
                    setSelectedLibrary(null); // 🛡️ 선택된 도서관 초기화
                    const regionCode = getRegionCode();
                    const targetIsbn = selectedBook.isbn13 || selectedBook.isbn;
                    // 🛡️ 내 주변: 선택한 지역 (구/시) 단위만 검색
                    if (targetIsbn && regionCode) await searchLibrariesWithBook(targetIsbn, regionCode, false, userLocation);
                  }} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", serviceFilter === 'all' ? "bg-white text-gray-900 shadow-md" : "text-gray-500")}>내 주변</button>
                <button onClick={async () => {
                    setServiceFilter('chaekium');
                    setSelectedLibrary(null); // 🛡️ 선택된 도서관 초기화
                    const regionCode = getRegionCode();
                    const targetIsbn = selectedBook.isbn13 || selectedBook.isbn;
                    // 🛡️ 책이음: 광역시도 단위로 검색 (내 주변보다 넓음, 줌아웃으로 더 확장 가능)
                    if (targetIsbn && regionCode) await searchLibrariesWithBook(targetIsbn, regionCode, true, userLocation);
                  }} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", serviceFilter === 'chaekium' ? "bg-amber-500 text-white shadow-lg shadow-amber-100" : "text-gray-500")}>💳 책이음</button>
                <button onClick={async () => {
                    setServiceFilter('chaekbada');
                    setSelectedLibrary(null); // 🛡️ 선택된 도서관 초기화
                    const regionCode = getRegionCode();
                    const targetIsbn = selectedBook.isbn13 || selectedBook.isbn;
                    // 🛡️ 책바다: 광역시도 단위로 검색 (내 주변보다 넓음, 줌아웃으로 더 확장 가능)
                    if (targetIsbn && regionCode) await searchLibrariesWithBook(targetIsbn, regionCode, true, userLocation);
                  }} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", serviceFilter === 'chaekbada' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "text-gray-500")}>🌊 책바다</button>
              </div>
            </div>

            {librariesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-24 bg-gradient-to-r from-white to-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="absolute inset-0 shimmer" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                {/* 🛡️ 책이음 서비스 설명 */}
                {serviceFilter === 'chaekium' && (
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-[2rem] border-2 border-amber-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-xl">💳</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-black text-amber-900 mb-1">책이음 서비스란?</h4>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          전국 공공도서관을 하나의 회원증으로 이용할 수 있는 통합 서비스입니다. 한 번만 가입하면 전국 어디서든 책을 빌릴 수 있어요!
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://books.nl.go.kr/PU/contents/P20201000000.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-black rounded-xl shadow-md transition-all"
                    >
                      <span>책이음 회원가입 하러가기</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* 🛡️ 책바다 서비스 설명 */}
                {serviceFilter === 'chaekbada' && (
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[2rem] border-2 border-emerald-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-xl">🌊</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-black text-emerald-900 mb-1">책바다 서비스란?</h4>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium mb-2">
                          우리 동네에 없는 책을 전국의 다른 도서관에서 빌려 집 근처 도서관으로 배달받을 수 있는 국가 상호대차 서비스입니다.
                        </p>
                        <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50/50 px-3 py-1.5 rounded-lg inline-block">
                          💰 배송비: 왕복 약 5,200원 (지자체 지원 가능)
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://books.nl.go.kr/PU/contents/P10201000000.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-xl shadow-md transition-all"
                    >
                      <span>책바다 신청하러 가기</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {filteredLibraries.map((lib, idx) => {
                    const services = checkLibraryServices(lib.libName);
                    return (
                      <motion.div
                        key={lib.libCode}
                        onClick={() => setSelectedLibrary(lib)}
                        className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm group cursor-pointer will-change-transform"
                        variants={staggerItem}
                        whileHover={{
                          y: -4,
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
                          transition: { type: "spring", stiffness: 300 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-black text-gray-900 text-lg group-hover:text-purple-600 transition-colors">{lib.libName}</h3>
                              <motion.button
                                onClick={(e) => toggleLibraryFavorite(e, lib)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5"
                              >
                                <Heart 
                                  className={cn(
                                    "w-5 h-5 transition-colors",
                                    isLibraryFavorite(lib.libCode) ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-400"
                                  )} 
                                />
                              </motion.button>
                              {/* 🛡️ 거리 표시 */}
                              {lib.distance !== undefined && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black border border-blue-100">
                                  📍 {formatDistance(lib.distance)}
                                </span>
                              )}
                            </div>
                            {lib.address && <div className="flex items-center gap-1 text-gray-400 mb-3"><MapPin className="w-3.5 h-3.5 shrink-0" /><p className="text-xs truncate font-bold">{lib.address}</p></div>}
                            <div className="flex flex-wrap gap-2 mb-4">
                               {(() => {
                                 const status = getOperatingStatus(lib.operatingTime, lib.closed);
                                 return (
                                   <span className={cn(
                                     "text-[10px] px-2 py-1 rounded-lg font-black border",
                                     status.status === 'OPEN' ? "bg-green-50 text-green-600 border-green-100" :
                                     status.status === 'CLOSED_DAY' ? "bg-red-50 text-red-600 border-red-100" :
                                     "bg-gray-50 text-gray-500 border-gray-100"
                                   )}>
                                     {status.status === 'OPEN' ? '🟢' : '⚪️'} {status.label}
                                   </span>
                                 );
                               })()}
                               <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-black border border-purple-100">평일 오전 방문 권장 ✨</span>
                               {services.isChaekium && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-black border border-amber-100">💳 책이음</span>}
                               {services.isChaekbada && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-black border border-emerald-100">🌊 책바다</span>}
                            </div>
                            {lib.homepage && <a href={lib.homepage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-50 text-[11px] font-black text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">도서관 상세정보 &gt;</a>}
                          </div>
                          <div className={cn("flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl text-[11px] font-black shrink-0 border-2 shadow-sm transition-all", lib.loanAvailable ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                            {lib.loanAvailable ? <><CheckCircle2 className="w-6 h-6 mb-0.5" /><span>대출가능!</span></> : <><XCircle className="w-6 h-6 mb-0.5" /><span>대출중</span></>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </div>
        )}

        {showSearchResults && books.length > 0 && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={handleCloseSearchResults} />
            <div className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] max-h-[75vh] bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="font-extrabold text-gray-900">검색 결과 ({books.length})</span>
                <button onClick={handleCloseSearchResults} className="p-2 bg-gray-50 text-gray-400 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div ref={searchResultsRef} className="overflow-y-auto p-4 space-y-3">
                {books.map((book) => (
                  <button key={book.isbn} onClick={() => handleBookSelect(book)} className="w-full p-4 bg-gray-50/50 rounded-2xl hover:bg-purple-50 transition-all text-left flex gap-4 group">
                    {book.bookImageURL ? <img src={book.bookImageURL} alt={book.title} className="w-16 h-24 object-cover rounded-xl shadow-md" /> : <div className="w-16 h-24 bg-gray-200 rounded-xl flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-400" /></div>}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">{book.title}</h3>
                      <p className="text-xs font-bold text-purple-500 mt-1">{book.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {!selectedBook && (
          mode === 'kids' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <KidsRecommendations onBookSelect={handleBookSelect} />
              <div className="mx-4 mt-8">
                <button onClick={() => setShowSmartFinder(true)} className="w-full p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-[2rem] shadow-xl flex items-center gap-4 group transition-all hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">✨</div>
                  <div className="text-left"><p className="font-black text-lg">우리 아이 맞춤 책 찾기</p><p className="text-xs text-white/80">3가지 질문으로 딱 맞는 책 추천</p></div>
                </button>
              </div>
              <LocalPopularBooks onBookSelect={handleBookSelect} />
              <div className="mx-4 mt-10 flex bg-gray-100/80 rounded-[1.5rem] p-1.5">
                <button onClick={() => setActiveTab('subject')} className={cn("flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all", activeTab === 'subject' ? "bg-white text-gray-900 shadow-md" : "text-gray-500")}>🌈 주제별</button>
                <button onClick={() => setActiveTab('situation')} className={cn("flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all", activeTab === 'situation' ? "bg-white text-gray-900 shadow-md" : "text-gray-500")}>💡 상황별</button>
              </div>
              {activeTab === 'subject' ? <KidsCategories onCategorySearch={handleCategorySearch} /> : <SituationCategories onCategorySearch={handleCategorySearch} />}
              <MonthlyTrends onKeywordSearch={handleCategorySearch} />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <section className="mx-4 mt-8 p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-purple-100">
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4"><span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase">Weekly Best</span></div>
                   <h2 className="text-2xl font-black leading-tight mb-2">우리 가족의<br />지혜를 채우는 시간</h2>
                   <p className="text-white/80 text-xs font-medium">가까운 도서관에서 새로운 세상을 만나보세요</p>
                 </div>
                 <LibraryIcon className="absolute right-[-20px] bottom-[-20px] opacity-10 w-48 h-48 rotate-12" />
              </section>
              <FamilyCategories onCategorySearch={handleCategorySearch} />
              <div className="mt-4"><MonthlyTrends onKeywordSearch={handleCategorySearch} /></div>
              <FamilyPopularBooks onBookSelect={handleBookSelect} />
              <section className="mx-4 mt-12 mb-20 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><span className="text-xl">💡</span>도서관 이용 꿀팁</h3>
                 <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
                    <p><strong className="text-purple-600">평일 오전 방문 추천:</strong> 도서관은 평일 오전 10~12시가 가장 한산해요. 조용한 환경에서 책을 고르고, 사서님께 직접 추천도 받을 수 있습니다.</p>
                    <p><strong className="text-purple-600">희망도서 신청 꿀팁:</strong> 신간이 나오면 도서관 홈페이지에서 바로 희망도서 신청하세요. 보통 1~2주 안에 구매해주고, 신청자에게 우선 대출 기회가 주어집니다.</p>
                    <p><strong className="text-purple-600">연체료 없는 반납 방법:</strong> 반납일이 다가오는데 다 못 읽었다면? 도서관 홈페이지나 앱에서 온라인 대출 연장(1~2회 가능)을 활용하세요. 예약자가 없으면 바로 연장됩니다.</p>
                    <p><strong className="text-purple-600">전자도서관 활용:</strong> 경기도사이버도서관, 서울도서관 등 전자도서관은 대기 없이 바로 대출 가능한 전자책이 많아요. 스마트폰 앱 하나면 언제 어디서나 무료로 읽을 수 있습니다.</p>
                    <p><strong className="text-purple-600">도서관 프로그램 활용:</strong> 대부분의 도서관은 무료 독서 프로그램, 작가 강연회, 영화 상영 등 다양한 문화 행사를 진행해요. 도서관 홈페이지나 공지사항을 주기적으로 확인하면 가족이 함께 즐길 수 있는 알찬 혜택을 받을 수 있습니다.</p>
                 </div>
              </section>
            </div>
          )
        )}
      </main>

      <SmartFinderModal isOpen={showSmartFinder} onClose={() => setShowSmartFinder(false)} onSearch={handleSmartSearch} />
    </div>
  );
}