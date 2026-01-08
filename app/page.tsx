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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* 타이틀 & 모드 토글 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">우리동네 도서관</h1>
                <p className="text-xs text-gray-500">원하는 책, 가까운 도서관에서 찾기</p>
              </div>
            </div>

            {/* 모드 선택 토글 */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setMode('general')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  mode === 'general'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                )}
              >
                📚 전체
              </button>
              <button
                onClick={() => setMode('kids')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  mode === 'kids'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                )}
              >
                👶 아이책
              </button>
            </div>
          </div>

          {/* 지역 선택 */}
          <RegionSelector />

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={mounted ? config.placeholder : "어떤 책을 찾으세요?"}
                className="pl-12 pr-20 h-12 rounded-xl border-gray-200 bg-white shadow-sm text-base"
              />
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
              >
                검색
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
      <main className="max-w-2xl mx-auto">
        {/* 선택된 책 정보 */}
        {selectedBook && (
          <div className="mx-4 mt-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative transition-all">
            {/* 닫기 버튼 */}
            <button
              onClick={clearLibraries}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="책 정보 닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 mb-4">
              {selectedBook.bookImageURL ? (
                <img
                  src={selectedBook.bookImageURL}
                  alt={selectedBook.title}
                  className="w-20 h-28 object-cover rounded-lg shadow-md shrink-0"
                />
              ) : (
                <div className="w-20 h-28 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{selectedBook.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{selectedBook.author}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{selectedBook.publisher}</span>
                  {selectedBook.publishYear && (
                    <>
                      <span className="w-px h-2 bg-gray-300" />
                      <span>{selectedBook.publishYear}년</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 상세 설명 */}
            {selectedBook.description && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">책 소개</h4>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                  {selectedBook.description}
                </p>
              </div>
            )}

            {/* 키워드/태그 */}
            {selectedBook.keywords && selectedBook.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedBook.keywords.slice(0, 5).map((keyword, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-md border border-blue-100"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 지도 영역 */}
        <div className="mx-4 mt-4 h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
          <LibraryMap libraries={selectedBook ? librariesWithBook : undefined} />
        </div>

        {/* 도서관 목록 */}
        {selectedBook && (
          <div className="mx-4 mt-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <LibraryIcon className="w-5 h-5 text-blue-500" />
                <span>"{selectedBook.title}" 소장 도서관</span>
                {librariesWithBook.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({librariesWithBook.length}곳)
                  </span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeepScan}
                className="text-xs text-blue-600 h-8 px-2 hover:bg-blue-50"
              >
                🕵️ 정밀 스캔
              </Button>
            </div>

            {librariesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : librariesWithBook.length > 0 ? (
              <div className="space-y-3">
                {librariesWithBook.map((lib) => (
                  <div
                    key={lib.libCode}
                    className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{lib.libName}</h3>
                        {lib.address && (
                          <p className="text-sm text-gray-500 mt-1 truncate">{lib.address}</p>
                        )}
                        {lib.homepage && (
                          <a
                            href={lib.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs text-blue-500 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50"
                          >
                            홈페이지 확인 &gt;
                          </a>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium shrink-0",
                          lib.loanAvailable
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        )}
                      >
                        {lib.loanAvailable ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>대출가능</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>대출중</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <LibraryIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>소장 도서관을 찾지 못했습니다</p>
                <p className="text-sm mt-1 text-gray-400 mb-4">API 데이터가 누락되었을 수 있습니다.</p>
                <Button onClick={handleDeepScan} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                   🔎 지역 내 모든 도서관 정밀 스캔하기
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 검색 결과 팝업 */}
        {showSearchResults && books.length > 0 && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowSearchResults(false)}
            />
            <div className="fixed inset-x-4 top-[200px] max-h-[60vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  검색 결과 ({books.length}권)
                </span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  닫기
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(60vh-52px)] p-4 space-y-3">
                {books.map((book) => (
                  <button
                    key={book.isbn}
                    onClick={() => handleBookSelect(book)}
                    className="w-full p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors text-left flex gap-3 group"
                  >
                    {book.bookImageURL ? (
                      <img
                        src={book.bookImageURL}
                        alt={book.title}
                        className="w-14 h-20 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all"
                      />
                    ) : (
                      <div className="w-14 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{book.author}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                        <span>{book.publisher}</span>
                        {book.publishYear && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                            <span>{book.publishYear}년</span>
                          </>
                        )}
                      </div>
                      {book.description && (
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 font-light italic">
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

        {/* 검색 결과 없음 */}
        {showSearchResults && !loading && books.length === 0 && searchQuery && (
          <div className="mx-4 mt-8 text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">다른 키워드로 검색해 보세요</p>
          </div>
        )}

        {/* 초기 상태 */}
        {!selectedBook && !showSearchResults && (
          <>
            {mounted && mode === 'kids' ? (
              <>
                {/* 아이책 모드: 추천 & 카테고리 */}
                <KidsRecommendations onBookSelect={handleBookSelect} />

                {/* 스마트 파인더 버튼 */}
                <div className="mx-4 mt-6">
                  <button
                    onClick={() => setShowSmartFinder(true)}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">✨</span>
                      <div className="text-left">
                        <p className="font-bold text-base">우리 아이 맞춤 책 찾기</p>
                        <p className="text-xs text-white/90">3가지 질문으로 딱 맞는 책 추천</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* 우리 동네 인기 책 */}
                <LocalPopularBooks onBookSelect={handleBookSelect} />

                {/* 탭 전환 UI */}
                <div className="mx-4 mt-6">
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setActiveTab('subject')}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'subject'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600"
                      )}
                    >
                      📚 주제별
                    </button>
                    <button
                      onClick={() => setActiveTab('situation')}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'situation'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600"
                      )}
                    >
                      💡 상황별
                    </button>
                  </div>
                </div>

                {/* 탭별 카테고리 표시 */}
                {mounted && activeTab === 'subject' && (
                  <KidsCategories onCategorySearch={handleCategorySearch} />
                )}
                {mounted && activeTab === 'situation' && (
                  <SituationCategories onCategorySearch={handleCategorySearch} />
                )}

                {/* 이달의 트렌드 키워드 */}
                <MonthlyTrends onKeywordSearch={handleCategorySearch} />
              </>
            ) : (
              /* 일반 모드: 안내 메시지 */
              <div className="mx-4 mt-12 text-center py-12">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">책을 검색해 보세요</h2>
                <p className="text-sm text-gray-500 mt-2">
                  원하는 책을 검색하면<br />
                  가까운 도서관에서 빌릴 수 있는지 알려드려요
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
