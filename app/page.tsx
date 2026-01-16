'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Bookmark, Library as LibraryIcon, BookOpen, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoritesStore } from '@/features/favorites/lib/use-favorites-store';
import { libraryApiClient } from '@/entities/book/api/library-api.client';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { useBookSearch } from '@/features/book-search/lib/use-book-search';
import { useLibrarySearch } from '@/features/library/lib/use-library-search';
import { useMapStore } from '@/features/library-map/lib/use-map-store';
import { useSearchMode } from '@/features/search-mode/lib/use-search-mode';
import { useAgeFilter } from '@/features/kids-mode/lib/use-age-filter';
import { KidsRecommendations } from '@/features/kids-mode/ui/kids-recommendations';
import { KidsModeBanner } from '@/features/kids-mode/ui/KidsModeBanner';
import { KidsCategories } from '@/features/kids-mode/ui/kids-categories';
import { SituationCategories } from '@/features/kids-mode/ui/situation-categories';
import { LocalPopularBooks } from '@/features/kids-mode/ui/local-popular-books';
import { SmartFinderModal } from '@/features/kids-mode/ui/smart-finder-modal';
import { MonthlyTrends } from '@/features/kids-mode/ui/monthly-trends';
import { NewArrivalsModal } from '@/features/new-arrivals/ui/new-arrivals-modal';
import { FamilyCategories } from '@/features/recommendations/ui/family-categories';
import { FamilyPopularBooks } from '@/features/recommendations/ui/family-popular-books';
import { HotTrendBooks } from '@/features/recommendations/ui/hot-trend-books';
import { NewArrivalsBooks } from '@/features/recommendations/ui/new-arrivals-books';
import { CoLoanBooks } from '@/features/recommendations/ui/co-loan-books';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { checkLibraryServices } from '@/shared/lib/utils/library-services';
import { getOperatingStatus } from '@/shared/lib/utils/library-status';
import { sanitizeHTML } from '@/shared/lib/utils/sanitize';
import { useLoadingStore, LOADING_KEYS } from '@/shared/lib/stores/use-loading-store';
import { staggerContainer } from '@/shared/lib/animations/variants';
import { cn } from '@/shared/lib/cn';
import { Book } from '@/entities/book/model/types';

// New extracted components
import { HomeHeader } from '@/features/home/ui/HomeHeader';
import { HomeFavorites } from '@/features/home/ui/HomeFavorites';
import { HomeSearchSection } from '@/features/home/ui/HomeSearchSection';
import { HomeMapSection } from '@/features/home/ui/HomeMapSection';
import { useRegionValidation } from '@/shared/lib/hooks/use-region-validation';
import { usePendingActionStore } from '@/shared/lib/stores/use-pending-action-store';
import { RegionRequiredModal } from '@/shared/ui/region-required-modal';
import { ReadStampButton } from '@/features/reading-record/ui/read-stamp-button';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSmartFinder, setShowSmartFinder] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'chaekium' | 'chaekbada'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { mode, getSearchConfig } = useSearchMode();
  const { selectedAge } = useAgeFilter();
  const config = getSearchConfig();
  // const { activeTab, setActiveTab } = useCategoryTab(); // Removed unused
  const {
    librariesWithBook,
    librariesLoading,
    searchLibrariesWithBook,
    clearLibraries,
  } = useLibrarySearch();

  useEffect(() => {
    if (mounted) {
      setSearchQuery('');
      setShowSearchResults(false);
      clearLibraries();
    }
  }, [mode, mounted, clearLibraries]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    getRegionCode,
    selectedRegion,
    selectedSubRegion,
    selectedDistrict,
  } = useRegionStore();
  const {
    books,
    loading,
    selectedBook,
    searchBooks,
    selectBook,
    searchByKdc,
    setBooks,
    totalCount,
  } = useBookSearch();
  // Duplicate useLibrarySearch removed
  const { loadLibraries, setSelectedLibrary, selectedLibrary } = useMapStore();
  const { withRegionCheck } = useRegionValidation();
  const { pendingAction, executePendingAction } = usePendingActionStore();

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
          // setBookSearchUserLocation(loc); // Removed as it's no longer in useBookSearch
          // console.log(`[HomePage] User location: ${loc.lat}, ${loc.lng}`);
        },
        () => {
          // console.warn('[HomePage] 위치 정보를 가져올 수 없습니다:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [mounted]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await searchBooks({ query: searchQuery });
    setShowSearchResults(true);
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySearch = withRegionCheck(async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    const regionCode = getRegionCode();
    
    // Logic updated to prioritize library-specific popularity
    if (kdc) {
      const currentLibraries = useMapStore.getState().getFilteredLibraries();
      
      // 1. 선택된 도서관이 있으면 그 도서관 기준 인기 도서
      // 2. 없으면 현재 지도에 보이는 첫 번째 도서관 기준 (지역 필터링 효과)
      const targetLibCode = selectedLibrary?.libCode || (currentLibraries.length > 0 ? currentLibraries[0].libCode : undefined);

      const data = await bookRepository.getPopularBooks({
        kdc,
        region: regionCode || undefined,
        libCode: targetLibCode,
        pageSize: 20,
      });
      if (data && data.length > 0) {
        setBooks(data);
        setShowSearchResults(true);
        return;
      }
    }
    // 일반 검색 시에도 지역 필터 + 인기순(대출순) 적용
    await searchBooks({ 
      query: keyword,
      region: regionCode || undefined,
      sort: 'loan' // 인기순 정렬
    });
    setShowSearchResults(true);
  });

  const handleSmartSearch = withRegionCheck(async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    const regionCode = getRegionCode();

    if (kdc) {
      const currentLibraries = useMapStore.getState().getFilteredLibraries();
      const targetLibCode = selectedLibrary?.libCode || (currentLibraries.length > 0 ? currentLibraries[0].libCode : undefined);
      
      await searchByKdc(kdc, keyword, regionCode || undefined, targetLibCode);
    } else {
      // 키워드 검색 시에도 지역 필터 + 인기순(대출순) 적용
      await searchBooks({ 
        query: keyword, 
        region: regionCode || undefined,
        sort: 'loan'
      });
    }
    setShowSearchResults(true);
  });

  const handleShowMorePopular = withRegionCheck(async () => {
    const { startLoading, stopLoading } = useLoadingStore.getState();
    startLoading(LOADING_KEYS.LOAD_POPULAR);
    
    try {
      const regionCode = getRegionCode();
      const currentLibraries = useMapStore.getState().getFilteredLibraries();
      const targetLibCode = selectedLibrary?.libCode || (currentLibraries.length > 0 ? currentLibraries[0].libCode : undefined);
      
      const popularBooks = await bookRepository.getPopularBooks({
        region: regionCode || undefined,
        libCode: targetLibCode,
        age: '14;20;30;40', // TODO: 모드에 따라 다르게? 현재는 성인 위주
        pageSize: 50,
      });
      
      if (popularBooks && popularBooks.length > 0) {
        setBooks(popularBooks);
        setShowSearchResults(true);
        setSearchQuery('인기 도서');
      }
    } finally {
      stopLoading(LOADING_KEYS.LOAD_POPULAR);
    }
  });

  const handleShowNewArrivals = withRegionCheck(async () => {
    const { startLoading, stopLoading } = useLoadingStore.getState();
    startLoading(LOADING_KEYS.SEARCH_BOOKS, '신착 도서 불러오는 중...');

    try {
      const regionCode = getRegionCode();
      const currentLibraries = useMapStore.getState().getFilteredLibraries();
      const targetLibCode = selectedLibrary?.libCode || (currentLibraries.length > 0 ? currentLibraries[0].libCode : undefined);
      
       // 지역 선택 안되어 있으면 종료 (withRegionCheck가 처리하지만 안전장치)
       if (!targetLibCode && !regionCode && !selectedSubRegion?.code) return;

       const params: any = { pageSize: 50 };
       
       if (targetLibCode) {
         params.libCode = targetLibCode;
       } else if (selectedSubRegion?.code) {
         params.dtl_region = selectedSubRegion.code;
       } else if (regionCode) {
         params.region = regionCode;
       }

       const response = await libraryApiClient.getExtendedLibraryInfo(params);
       const libs = response?.response?.libs || [];
       
       if (libs.length > 0) {
         const lib = libs[0].lib;
         const libraryName = lib.libInfo?.libName || '우리 동네 도서관';
         
         const { isExcludedBook } = await import('@/entities/book/lib/book-filter');

         let newBooks: Book[] = (lib.newBooks || []).map((item: any) => ({
           isbn: item.book?.isbn13 || item.book?.isbn,
           isbn13: item.book?.isbn13,
           title: item.book?.bookname,
           author: item.book?.authors,
           publisher: item.book?.publisher,
           publishYear: item.book?.publication_year,
           bookImageURL: item.book?.bookImageURL,
           additionSymbol: item.book?.addition_symbol,
           classNo: item.book?.class_no,
           className: item.book?.class_nm,
         }));

         // 필터링 적용
         if (mode === 'kids') {
           newBooks = newBooks.filter(book => 
             book.additionSymbol?.startsWith('7') && !isExcludedBook(book.title)
           );
         } else {
            // 중복 제거
           const seen = new Set();
           newBooks = newBooks.filter(book => {
             const key = book.isbn13 || book.isbn;
             if (key && seen.has(key)) return false;
             if (key) seen.add(key);
             return true;
           });
         }

         setBooks(newBooks);
         setShowSearchResults(true);
         setSearchQuery(`${libraryName} 신착 도서`);
       }

    } catch (error) {
      console.error('Failed to load new arrivals:', error);
    } finally {
      stopLoading(LOADING_KEYS.SEARCH_BOOKS);
    }
  });

  const [reviews, setReviews] = useState<{ title: string; link: string; bloggername: string; description: string }[]>([]);
  const [usageData, setUsageData] = useState<{ loanGrps: { gender: string; age: string; ranking: string }[] } | null>(null);

  const handleOpenSmartFinder = withRegionCheck(() => {
    setShowSmartFinder(true);
  });

  const handleBookSelect = withRegionCheck(async (book: Book) => {
    // ✅ 표지 없으면 네이버에서 가져오기
    let bookWithCover = book;
    if (!book.bookImageURL || book.bookImageURL.trim() === '') {
      const { getBookCoverImage } = await import('@/shared/lib/utils/book-cover-fallback');
      const coverUrl = await getBookCoverImage(
        book.bookImageURL,
        book.isbn13 || book.isbn,
        book.title
      );
      if (coverUrl) {
        bookWithCover = { ...book, bookImageURL: coverUrl };
      }
    }
    
    selectBook(bookWithCover);
    setShowSearchResults(false);
    
    // 비동기 데이터 로딩
    const [reviewData, analysisData] = await Promise.all([
      bookRepository.getBlogReviews(bookWithCover.title),
      bookRepository.getUsageAnalysis(bookWithCover.isbn13 || bookWithCover.isbn),
    ]);
    setReviews(reviewData);
    setUsageData(analysisData);

    const regionCode = getRegionCode();
    // 내부 region check 제거 (withRegionCheck로 대체됨)
    
    const targetIsbn = bookWithCover.isbn13 || bookWithCover.isbn;
    if (targetIsbn && regionCode) {
      await searchLibrariesWithBook(targetIsbn, regionCode, false, userLocation);
    }
  }, 'book-select');  // 🔥 action type 추가

  // 🛡️ 대출 가능 여부 필터 상태 (책이음/책바다의 경우 기본값 true)
  const [onlyAvailable, setOnlyAvailable] = useState(false);



  // 🛡️ 필터링된 도서관 목록 계산
  const filteredLibraries = useMemo(() => {
    return librariesWithBook.filter((lib) => {
      // 1. 서비스 필터
      const services = checkLibraryServices(lib.libName);
      let serviceMatch = true;
      if (serviceFilter === 'chaekium') serviceMatch = services.isChaekium;
      if (serviceFilter === 'chaekbada') serviceMatch = services.isChaekbada;

      // 2. 대출 가능 여부 필터
      let availabilityMatch = true;
      if (onlyAvailable) {
        availabilityMatch = lib.loanAvailable ?? false;
      }

      return serviceMatch && availabilityMatch;
    });
  }, [librariesWithBook, serviceFilter, onlyAvailable]);

  // 🛡️ [Manual Search Logic] 줌 레벨이 변경되어도 자동 검색하지 않음 (유저가 버튼 클릭)
  const handleZoomChange = (level: number) => {
    // console.log(`[HomePage] Zoom Level Changed: ${level}`);
  };


  // 🛡️ 지역 변경 시 지도용 도서관 목록 로드
  useEffect(() => {
    const regionCode = getRegionCode();
    if (regionCode && mounted) {
      loadLibraries(regionCode);
    }
  }, [selectedRegion?.code, selectedSubRegion?.code, selectedDistrict?.code, mounted, loadLibraries, getRegionCode]);

  // 🛡️ 지역/필터 변경 시 선택된 책의 도서관 재검색
  useEffect(() => {
    if (!selectedBook || !mounted) return;
    
    const regionCode = getRegionCode();
    
    // 🔍 [Logic Change] 
    // 기존: 책이음/책바다는 무조건 전국 검색 or 상세 지역
    // 변경: 책이음/책바다는 '기본 범위'를 '도/시' 단위(Province)로 넓혀서 보여줌
    // 예: '광명시' 선택 -> '경기도' 전체에서 책이음/책바다 검색 (주변 도시 포함)
    
    let isNationwide = !regionCode;
    let searchRegion = regionCode || '';

    // 책이음/책바다인 경우, 너무 좁은 지역(구/시)보다는 '도/광역' 단위로 넓혀서 검색
    if ((serviceFilter === 'chaekium' || serviceFilter === 'chaekbada') && selectedRegion) {
       searchRegion = selectedRegion.code; // 도/광역시 코드로 덮어씀 (예: 경기도)
       isNationwide = false; // 전국은 아니지만 넓은 지역
    }

    // 지역 코드도 없고 전국 검색도 아니면 검색 불가 (방어 코드)
    if (!isNationwide && !searchRegion) return;

    const targetIsbn = selectedBook.isbn13 || selectedBook.isbn;
    if (targetIsbn) {
      searchLibrariesWithBook(targetIsbn, searchRegion, isNationwide, userLocation);
    }
  }, [
    selectedRegion?.code,
    selectedSubRegion?.code,
    selectedDistrict?.code,
    selectedBook,
    mounted,
    serviceFilter, // 필터 변경 시에도 재검색 (필요할 경우)
    getRegionCode,
    searchLibrariesWithBook,
    userLocation,
  ]);


  
  const { isBookFavorite, addBook, removeBook } = useFavoritesStore();
  
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
        <div
          className="absolute top-60 -left-40 w-96 h-96 bg-warmth-200 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <HomeHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearch={handleSearch} 
        loading={loading}
        config={config}
        setShowSearchResults={setShowSearchResults}
      />

      {/* 🚀 신착 도서 팝업 */}
      <NewArrivalsModal 
        onBookSelect={handleBookSelect} 
        onShowAll={handleShowNewArrivals}
      />

      <HomeSearchSection 
        showSearchResults={showSearchResults}
        searchQuery={searchQuery}
        handleCloseSearchResults={handleCloseSearchResults}
        handleBookSelect={handleBookSelect}
        books={books}
        totalCount={totalCount}
      />

      <main className="max-w-2xl mx-auto pb-20 relative z-10">
        
        <HomeFavorites 
          handleBookSelect={handleBookSelect} 
          selectedBook={selectedBook}
          showSearchResults={showSearchResults}
        />

        {!selectedBook && !showSearchResults && mode === 'kids' && ['0-2', '3-5', '6-7'].includes(selectedAge) && (
          <div className="px-4 mb-4">
             <KidsModeBanner onClick={handleOpenSmartFinder} />
          </div>
        )}

        {selectedBook && (
          <div className="mx-4 mt-6 p-6 bg-white rounded-[2rem] border-2 border-purple-50 shadow-xl shadow-purple-100/50 relative transition-all animate-in zoom-in-95 duration-300">
             <button
              onClick={() => {
                clearLibraries();
                selectBook(null);
              }}
              className="absolute -top-2 -right-2 p-2 bg-white text-gray-400 hover:text-gray-600 shadow-lg border border-gray-100 rounded-full transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-6 mb-6">
              {selectedBook.bookImageURL ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-200 rounded-2xl rotate-3 scale-95 opacity-50 group-hover:rotate-6 transition-transform" />
                  <Image
                    src={selectedBook.bookImageURL}
                    alt={selectedBook.title}
                    width={112}
                    height={160}
                    className="relative w-28 h-40 object-cover rounded-2xl shadow-lg shrink-0"
                  />
                </div>
              ) : (
                <div className="w-28 h-40 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0 border-2 border-dashed border-purple-200">
                  <BookOpen className="w-12 h-12 text-purple-200" />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedBook.className && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                      {selectedBook.className}
                    </span>
                  )}
                  {selectedBook.loanCnt && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                      누적 대출 {selectedBook.loanCnt.toLocaleString()}회
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="font-extrabold text-2xl text-gray-900 leading-tight line-clamp-2">
                    {selectedBook.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <ReadStampButton
                      book={{
                        isbn: selectedBook.isbn13 || selectedBook.isbn,
                        title: selectedBook.title,
                        author: selectedBook.author || '',
                        image: selectedBook.bookImageURL || '',
                      }}
                    />
                    <motion.button
                      onClick={(e) => toggleBookFavorite(e, selectedBook)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        'p-3 rounded-2xl border-2 transition-all',
                        isBookFavorite(selectedBook.isbn13 || selectedBook.isbn)
                          ? 'bg-purple-100 border-purple-200 text-purple-600'
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-purple-200'
                      )}
                    >
                      <Bookmark
                        className={cn(
                          'w-6 h-6',
                          isBookFavorite(selectedBook.isbn13 || selectedBook.isbn) && 'fill-current'
                        )}
                      />
                    </motion.button>
                  </div>
                </div>
                <p className="text-base font-bold text-purple-600 mb-2">{selectedBook.author}</p>
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                    {selectedBook.publisher}
                  </span>
                  {selectedBook.publishYear && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                      {selectedBook.publishYear}년
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selectedBook.description && (
              <div className="mt-4 p-5 bg-purple-50/50 rounded-2xl border border-purple-100/30">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-3 px-1">
                  줄거리 미리보기
                </h4>
                <p className="text-[15px] text-gray-800 leading-[1.8] font-medium tracking-tight">
                  {selectedBook.description}
                </p>
              </div>
            )}
            
             {usageData?.loanGrps && usageData.loanGrps.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                  이 책, 누가 좋아할까요?
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {usageData.loanGrps.slice(0, 3).map((grp: { gender: string; age: string; ranking: string }, i: number) => {
                    const gender = grp.gender === '0' ? '남성' : '여성';
                    const age = grp.age ? `${grp.age}대` : '';
                    const ranking = grp.ranking ? `${grp.ranking}위` : '';

                    if (!age && !ranking) return null;

                    return (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center"
                      >
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full mb-1 ${grp.gender === '0' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}
                        >
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

            {/* 🔗 함께 대출된 도서 */}
            {selectedBook.isbn && (
              <CoLoanBooks 
                isbn={selectedBook.isbn13 || selectedBook.isbn} 
                onBookSelect={handleBookSelect} 
              />
            )}

            {reviews.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                  먼저 읽어본 사람들의 이야기
                </h4>
                <div className="space-y-3">
                  {reviews.map((rev, i) => (
                    <a
                      key={i}
                      href={rev.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 transition-all shadow-sm group"
                    >
                      <h5
                        className="text-sm font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(rev.title) }}
                      />
                       <p
                        className="text-xs text-gray-500 line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(rev.description) }}
                      />
                      <div className="mt-2 text-[10px] text-purple-400 font-bold">
                        블로그 리뷰 보기 &gt;
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {selectedBook && (
          <div className="mx-4 mt-8 mb-6">
            <div className="flex flex-col gap-6 mt-8 mb-6 px-2">
               <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <LibraryIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <span>어떻게 빌릴까요?</span>
                </h2>
              </div>
              
              {mode === 'kids' && ['0-2', '3-5', '6-7'].includes(selectedAge) && (
                <div className="px-4 mb-4">
                   <KidsModeBanner onClick={handleOpenSmartFinder} />
                </div>
              )}

              <HomeMapSection 
                selectedBook={selectedBook} 
                serviceFilter={serviceFilter} 
                librariesWithBook={filteredLibraries} 
                userLocation={userLocation}
                onZoomChange={handleZoomChange}
              />
               
               <div className="flex bg-gray-100/80 p-1.5 rounded-[1.5rem] gap-1 mb-4">
                  <button
                  onClick={() => {
                    setServiceFilter('all');
                    setSelectedLibrary(null);
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-xs font-black transition-all',
                    serviceFilter === 'all' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500'
                  )}
                >
                  소장 도서관
                </button>
                  <button
                  onClick={() => {
                    setServiceFilter('chaekium');
                    setSelectedLibrary(null);
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-xs font-black transition-all',
                    serviceFilter === 'chaekium'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-100'
                      : 'text-gray-500'
                  )}
                >
                  💳 책이음
                </button>
                <button
                  onClick={() => {
                    setServiceFilter('chaekbada');
                    setSelectedLibrary(null);
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-xs font-black transition-all',
                    serviceFilter === 'chaekbada'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                      : 'text-gray-500'
                  )}
                >
                  🌊 책바다
                </button>
               </div>

                <div className="flex flex-col gap-2 mb-4 px-2">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => setOnlyAvailable(!onlyAvailable)}
                         className={cn(
                           "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                           onlyAvailable 
                             ? "bg-green-100 text-green-700 border-green-200" 
                             : "bg-white text-gray-500 border-gray-200"
                         )}
                       >
                         <div className={cn(
                           "w-2 h-2 rounded-full",
                           onlyAvailable ? "bg-green-500" : "bg-gray-300"
                         )} />
                         대출 가능만 보기
                       </button>
                     </div>
                     
                     {/* 확장 검색 안내 배너 (조건부 렌더링) */}
                     {(serviceFilter !== 'all' && librariesWithBook.length > 0 && onlyAvailable) && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 animate-pulse">
                           <span>🔭</span>
                           <span>더 넓은 지역에서 찾는 중...</span>
                        </div>
                     )}
                   </div>

                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-2">
                      <div className="flex items-start gap-2 text-blue-800">
                        <span className="mt-0.5 text-sm">ℹ️</span>
                        <div className="text-xs font-medium leading-relaxed">
                          <p className="mb-0.5 font-bold">대출 가능 여부는 실시간이 아닐 수 있어요</p>
                          <p className="text-blue-600">
                            방문 전 <span className="font-bold underline">홈페이지/예약 바로가기</span>로 정확한 상태를 확인해주세요!
                          </p>
                        </div>
                      </div>
                   </div>
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
                  {/* Service info banners */}
                   {serviceFilter === 'chaekium' && (
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-[2rem] border-2 border-amber-200 shadow-sm">
                     {/* ... Service Banner Content - can be extracted too later ... */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-xl">💳</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-black text-amber-900 mb-1">
                            책이음 서비스란?
                          </h4>
                          <p className="text-xs text-amber-800 leading-relaxed font-medium mb-2">
                            전국 공공도서관을 하나의 회원증으로 이용할 수 있는 통합 서비스입니다. 한
                            번만 가입하면 전국 어디서든 책을 빌릴 수 있어요!
                          </p>
                          <a 
                            href="https://books.nl.go.kr/PU/contents/P50700000000.do?schM=userjoinTerms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-amber-900 underline flex items-center gap-1 hover:opacity-70 transition-opacity"
                          >
                            🔗 책이음/책바다 회원가입 안내 바로가기
                          </a>
                        </div>
                      </div>
                  </div>
                )}
                {serviceFilter === 'chaekbada' && (
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[2rem] border-2 border-emerald-200 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-xl">🌊</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-black text-emerald-900 mb-1">
                            책바다 서비스란?
                          </h4>
                          <p className="text-xs text-emerald-800 leading-relaxed font-medium mb-2">
                            다른 지역 도서관 책을 우리 동네 도서관에서 받아볼 수 있는 상호대차 서비스입니다!
                          </p>
                          <a 
                            href="https://books.nl.go.kr/PU/contents/P50700000000.do?schM=userjoinTerms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-900 underline flex items-center gap-1 hover:opacity-70 transition-opacity"
                          >
                            🔗 책이음/책바다 회원가입 안내 바로가기
                          </a>
                        </div>
                      </div>
                  </div>
                )}

                {/* 📚 도서관 목록 카드 */}
                {filteredLibraries.length > 0 ? (
                  filteredLibraries.map((lib) => {
                    const services = checkLibraryServices(lib.libName);
                    return (
                      <motion.div
                        key={lib.libCode}
                        variants={{
                          initial: { opacity: 0, y: 20 },
                          animate: { opacity: 1, y: 0 },
                        }}
                        className={cn(
                          "p-4 bg-white rounded-2xl border-2 transition-all cursor-pointer",
                          selectedLibrary?.libCode === lib.libCode
                            ? "border-purple-400 shadow-lg shadow-purple-100"
                            : "border-gray-100 hover:border-purple-200"
                        )}
                        onClick={() => setSelectedLibrary(lib)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            lib.loanAvailable ? "bg-green-100" : "bg-gray-100"
                          )}>
                            <LibraryIcon className={cn(
                              "w-6 h-6",
                              lib.loanAvailable ? "text-green-600" : "text-gray-400"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 truncate">
                                {lib.libName}
                              </h3>
                              {lib.loanAvailable ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full shrink-0">
                                  대출가능
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full shrink-0">
                                  대출불가
                                </span>
                              )}
                            </div>
                            {lib.address && <div className="flex items-center gap-1 text-gray-400 mb-3"><MapPin className="w-3.5 h-3.5 shrink-0" /><p className="text-xs truncate font-bold">{lib.address}</p></div>}
                                                         <div className="flex flex-wrap gap-2 mb-4">
                                                           {(() => {
                                                             const status = getOperatingStatus(lib.operatingTime, lib.closed);
                                                             if (status.status === 'UNKNOWN') return null;
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

                            </div>

                          </div>
                          <div className={cn("flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl text-[11px] font-black shrink-0 border-2 shadow-sm transition-all", lib.loanAvailable ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                            {lib.loanAvailable ? <><CheckCircle2 className="w-6 h-6 mb-0.5" /><span>대출가능!</span></> : <><XCircle className="w-6 h-6 mb-0.5" /><span>대출중</span></>}
                          </div>
                        </div>
                        {lib.homepage && (
                          <a
                            href={lib.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 hover:shadow-lg transition-all active:scale-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>🔗</span>
                            홈페이지/예약 바로가기
                          </a>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">선택한 조건에 맞는 도서관이 없습니다</p>
                  </div>
                )}
              </motion.div>
            )}
           </div>
        )}

        {/* Categories Sections */}
        {!selectedBook && !showSearchResults && (
          <>
            <motion.section
              className="mt-6 mx-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {mode === 'kids' ? (
                <>
                  {/* Map Section (Moved to Top) */}
                  <div className="mt-8">
                     <HomeMapSection 
                        selectedBook={null}
                        serviceFilter={serviceFilter} 
                        librariesWithBook={filteredLibraries} 
                        userLocation={userLocation}
                      />
                  </div>
                  
                  <div className="mt-8">
                     <KidsRecommendations onBookSelect={handleBookSelect} />
                  </div>
                  
                  <div className="mt-8">
                     <LocalPopularBooks onBookSelect={handleBookSelect} />
                  </div>
                  
                  {/* 🔥 급상승 도서 (아동용 필터링) */}
                  <HotTrendBooks onBookSelect={handleBookSelect} filterKids={true} />

                  {/* Subject Search (Moved Down) */}
                  <KidsCategories
                    onCategorySearch={(keyword, kdc) => handleCategorySearch(keyword, kdc)}
                  />
                </>
              ) : (
                <FamilyCategories onCategorySearch={(keyword, kdc) => handleCategorySearch(keyword, kdc)} />
              )}
            </motion.section>

             <AnimatePresence mode="wait">
              {mode === 'kids' ? (
                <motion.div
                  key="kids-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Situation & Smart Finder Section - Moved Down */}
                  <div className="mt-8">
                    <SituationCategories onCategorySearch={(keyword) => handleCategorySearch(keyword)} />
                  </div>

                   <SmartFinderModal
                    isOpen={showSmartFinder}
                    onClose={() => setShowSmartFinder(false)}
                    onSearch={handleSmartSearch}
                  />





                   <div className="mt-8">
                     <MonthlyTrends onKeywordSearch={(keyword) => handleCategorySearch(keyword)} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="general-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 mt-8"
                >
                   <HomeMapSection 
                      selectedBook={null}
                      serviceFilter={serviceFilter} 
                      librariesWithBook={filteredLibraries} 
                      userLocation={userLocation}
                    />
                  
                  {/* 🔥 급상승 도서 (전체) */}
                  <HotTrendBooks onBookSelect={handleBookSelect} filterKids={false} />
                  
                  <FamilyPopularBooks onBookSelect={handleBookSelect} onShowMore={handleShowMorePopular} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* 📍 지역 선택 모달 (Global) - Main 밖으로 이동하여 z-index 문제 해결 */}
      <RegionRequiredModal 
        onRegionSelected={() => {
          // 지역 선택 후 pending action 실행
          const action = executePendingAction();
          if (action?.type === 'book-select' && action.payload) {
            handleBookSelect(action.payload);
          }
        }} 
      />
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
