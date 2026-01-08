"use client";

import { useEffect } from "react";
import { Search, MapPin, BookOpen, Library as LibraryIcon, CheckCircle2, XCircle, X } from "lucide-react";
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
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { useState } from "react";
import { Book } from "@/entities/book/model/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSmartFinder, setShowSmartFinder] = useState(false);

  const { mode, setMode, getSearchConfig } = useSearchMode();
  const config = getSearchConfig();
  const { activeTab, setActiveTab } = useCategoryTab();

  // Hydration 에러 방지: 클라이언트에서만 persist 상태 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  const { getRegionCode, getDisplayName, selectedRegion } = useRegionStore();
  const {
    books,
    loading,
    selectedBook,
    librariesWithBook,
    librariesLoading,
    searchBooks,
    selectBook,
    searchLibrariesWithBook,
    clearSearch,
    deepScan,
    clearLibraries, // ✅ 추가됨
    searchByKdc, // ✅ KDC 검색 추가
  } = useBookSearch();
  const { loadLibraries } = useMapStore();

  // 검색 실행
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    await searchBooks({ query: searchQuery });
    setShowSearchResults(true);
  };

  // 카테고리 검색 (KDC 우선, 없으면 키워드)
  const handleCategorySearch = async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    
    if (kdc) {
      await searchByKdc(kdc, keyword);
    } else {
      await searchBooks({ query: keyword });
    }
    
    setShowSearchResults(true);
  };

  // 스마트 파인더로 검색
  const handleSmartSearch = async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    
    if (kdc) {
      await searchByKdc(kdc, keyword);
    } else {
      await searchBooks({ query: keyword });
    }

    setShowSearchResults(true);
  };

  // 책 선택 → 도서관 검색
  const handleBookSelect = async (book: Book) => {
    selectBook(book);
    setShowSearchResults(false);

    const regionCode = getRegionCode();
    
    // 지역 선택 확인
    if (!regionCode) {
      alert("먼저 검색할 지역을 선택해주세요!");
      // 지역 선택 드롭다운을 열어주는 것이 좋으나 일단 알림으로 대체
      return;
    }

    // ISBN13 우선 사용 (없으면 기본 ISBN, 그것도 없으면 에러)
    const targetIsbn = book.isbn13 || book.isbn;
    if (targetIsbn) {
      await searchLibrariesWithBook(targetIsbn, regionCode);
    } else {
      console.warn("ISBN 정보가 없는 도서입니다:", book);
      alert("도서 ISBN 정보가 없어 검색할 수 없습니다.");
    }
  };

  // 정밀 스캔 실행
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

  // 지역 변경 시 도서관 목록 갱신
  useEffect(() => {
    const regionCode = getRegionCode();
    if (regionCode) {
      loadLibraries(regionCode);
    }
  }, [selectedRegion, getRegionCode, loadLibraries]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-50 via-white to-sky-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* 타이틀 & 모드 토글 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">우리 아이 <span className="text-orange-500">도서관</span></h1>
                <p className="text-xs font-medium text-gray-500">따뜻한 이야기, 가까운 곳에서 찾아요</p>
              </div>
            </div>

            {/* 모드 선택 토글 */}
            <div className="flex bg-gray-100/80 rounded-2xl p-1 border border-gray-200/50">
              <button
                onClick={() => setMode('kids')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  mode === 'kids'
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                🧸 아이책
              </button>
              <button
                onClick={() => setMode('general')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  mode === 'general'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                📚 전체
              </button>
            </div>
          </div>

          {/* 지역 선택 */}
          <div className="bg-white/50 rounded-2xl p-1">
            <RegionSelector />
          </div>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={mounted ? config.placeholder : "어떤 책을 찾으세요?"}
                className="pl-12 pr-24 h-14 rounded-2xl border-2 border-gray-100 bg-white shadow-md focus:border-orange-200 focus:ring-orange-100 text-base font-medium transition-all"
              />
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md shadow-orange-100"
              >
                {loading ? "찾는 중..." : "찾기"}
              </Button>
            </div>
          </form>

          {/* 아이책 모드일 때만: 연령 필터 */}
          {mounted && config.showKidsFeatures && (
            <AgeFilter />
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-2xl mx-auto pb-20">
        {/* 선택된 책 정보 */}
        {selectedBook && (
          <div className="mx-4 mt-6 p-6 bg-white rounded-[2rem] border-2 border-orange-50 shadow-xl shadow-orange-100/50 relative transition-all animate-in zoom-in-95 duration-300">
            {/* 닫기 버튼 */}
            <button
              onClick={clearLibraries}
              className="absolute -top-2 -right-2 p-2 bg-white text-gray-400 hover:text-gray-600 shadow-lg border border-gray-100 rounded-full transition-all hover:rotate-90"
              aria-label="책 정보 닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-6 mb-6">
              {selectedBook.bookImageURL ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-200 rounded-2xl rotate-3 scale-95 opacity-50 group-hover:rotate-6 transition-transform" />
                  <img
                    src={selectedBook.bookImageURL}
                    alt={selectedBook.title}
                    className="relative w-24 h-36 object-cover rounded-2xl shadow-lg shrink-0"
                  />
                </div>
              ) : (
                <div className="w-24 h-36 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border-2 border-dashed border-orange-200">
                  <BookOpen className="w-12 h-12 text-orange-200" />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-extrabold text-xl text-gray-900 leading-tight mb-2 line-clamp-2">{selectedBook.title}</h3>
                <p className="text-sm font-bold text-orange-600 mb-2">{selectedBook.author}</p>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md">{selectedBook.publisher}</span>
                  {selectedBook.publishYear && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md">{selectedBook.publishYear}년</span>
                  )}
                </div>
              </div>
            </div>

            {/* 상세 설명 */}
            {selectedBook.description && (
              <div className="mt-4 p-4 bg-orange-50/50 rounded-2xl">
                <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-2 px-1">줄거리 미리보기</h4>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 font-medium">
                  {selectedBook.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 지도 영역 */}
        <div className="mx-4 mt-6 h-[350px] rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 relative group">
          <LibraryMap libraries={selectedBook ? librariesWithBook : undefined} />
          {!selectedBook && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent flex items-end p-6">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-gray-700">우리 동네 도서관 위치예요</span>
              </div>
            </div>
          )}
        </div>

        {/* 도서관 목록 */}
        {selectedBook && (
          <div className="mx-4 mt-8 mb-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <LibraryIcon className="w-5 h-5 text-green-600" />
                </div>
                <span>빌릴 수 있는 곳</span>
                {librariesWithBook.length > 0 && (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-bold">
                    {librariesWithBook.length}
                  </span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeepScan}
                className="text-xs font-bold text-blue-600 h-9 px-3 hover:bg-blue-50 rounded-xl border border-blue-100 shadow-sm"
              >
                🔎 근처 더 찾아보기
              </Button>
            </div>

            {librariesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : librariesWithBook.length > 0 ? (
              <div className="space-y-4">
                {librariesWithBook.map((lib) => (
                  <div
                    key={lib.libCode}
                    className="p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1">{lib.libName}</h3>
                        {lib.address && (
                          <div className="flex items-center gap-1 text-gray-500 mb-3">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <p className="text-xs truncate font-medium">{lib.address}</p>
                          </div>
                        )}
                        {lib.homepage && (
                          <a
                            href={lib.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            도서관 홈페이지 가기
                          </a>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-xs font-black shrink-0 shadow-sm border",
                          lib.loanAvailable
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        )}
                      >
                        {lib.loanAvailable ? (
                          <>
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mb-1 shadow-sm">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span>대출가능!</span>
                          </>
                        ) : (
                          <>
                             <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-white mb-1 shadow-sm">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <span>대출중</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LibraryIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-bold text-gray-600">지금은 빌릴 수 있는 곳이 없나 봐요</p>
                <p className="text-sm mt-2 text-gray-400 mb-6 font-medium">다른 도서관을 더 꼼꼼히 찾아볼까요?</p>
                <Button onClick={handleDeepScan} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-100">
                   🔎 모든 도서관 정밀 찾기
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 검색 결과 팝업 */}
        {showSearchResults && books.length > 0 && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in"
              onClick={() => setShowSearchResults(false)}
            />
            <div className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] max-h-[75vh] bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-6 bg-orange-400 rounded-full" />
                  <span className="font-extrabold text-gray-900">
                    이런 책을 찾았어요 ({books.length})
                  </span>
                </div>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
                {books.map((book) => (
                  <button
                    key={book.isbn}
                    onClick={() => handleBookSelect(book)}
                    className="w-full p-4 bg-gray-50/50 rounded-2xl hover:bg-orange-50 transition-all text-left flex gap-4 group border border-transparent hover:border-orange-100"
                  >
                    {book.bookImageURL ? (
                      <img
                        src={book.bookImageURL}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{book.title}</h3>
                      <p className="text-xs font-bold text-orange-500 mt-1 line-clamp-1">{book.author}</p>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 mt-2">
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{book.publisher}</span>
                        {book.publishYear && (
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{book.publishYear}년</span>
                        )}
                      </div>
                      {book.description && (
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-2 font-medium italic">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 초기 상태 */}
        {!selectedBook && !showSearchResults && (
          <>
            {mounted && mode === 'kids' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* 아이책 모드: 추천 & 카테고리 */}
                <KidsRecommendations onBookSelect={handleBookSelect} />

                {/* 스마트 파인더 버튼 */}
                <div className="mx-4 mt-8">
                  <button
                    onClick={() => setShowSmartFinder(true)}
                    className="w-full p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-[2rem] shadow-xl shadow-purple-100 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                        <BookOpen className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                        ✨
                      </div>
                      <div className="text-left">
                        <p className="font-black text-lg tracking-tight">우리 아이 맞춤 책 찾기</p>
                        <p className="text-xs text-white/80 font-medium">몇 가지 질문으로 딱 맞는 책을 골라드려요</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* 우리 동네 인기 책 */}
                <div className="mt-4">
                    <LocalPopularBooks onBookSelect={handleBookSelect} />
                </div>

                {/* 탭 전환 UI */}
                <div className="mx-4 mt-10">
                  <div className="flex bg-gray-100/80 backdrop-blur rounded-[1.5rem] p-1.5 border border-gray-200/50 shadow-inner">
                    <button
                      onClick={() => setActiveTab('subject')}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all",
                        activeTab === 'subject'
                          ? "bg-white text-gray-900 shadow-md"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      🌈 주제별
                    </button>
                    <button
                      onClick={() => setActiveTab('situation')}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all",
                        activeTab === 'situation'
                          ? "bg-white text-gray-900 shadow-md"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      💡 상황별
                    </button>
                  </div>
                </div>

                {/* 탭별 카테고리 표시 */}
                <div className="min-h-[300px]">
                    {mounted && activeTab === 'subject' && (
                    <KidsCategories onCategorySearch={handleCategorySearch} />
                    )}
                    {mounted && activeTab === 'situation' && (
                    <SituationCategories onCategorySearch={handleCategorySearch} />
                    )}
                </div>

                {/* 이달의 트렌드 키워드 */}
                <MonthlyTrends onKeywordSearch={handleCategorySearch} />
              </div>
            ) : (
              /* 일반 모드: 안내 메시지 */
              <div className="mx-4 mt-16 text-center py-20 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-200">
                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-blue-300" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-800">어떤 책을 빌려볼까요?</h2>
                <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">
                  원하는 책을 검색하면<br />
                  가까운 도서관에 있는지 바로 확인해 드려요
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 스마트 파인더 모달 */}
      <SmartFinderModal
        isOpen={showSmartFinder}
        onClose={() => setShowSmartFinder(false)}
        onSearch={handleSmartSearch}
      />
    </div>
  );
}
