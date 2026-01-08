"use client";

import { useEffect, useState } from "react";
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
import { FamilyCategories } from "@/features/recommendations/ui/family-categories";
import { FamilyPopularBooks } from "@/features/recommendations/ui/family-popular-books";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { Book } from "@/entities/book/model/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSmartFinder, setShowSmartFinder] = useState(false);

  const { mode, setMode, getSearchConfig } = useSearchMode();
  const config = getSearchConfig();
  const { activeTab, setActiveTab } = useCategoryTab();

  // 탭(모드) 전환 시 검색 상태 초기화
  useEffect(() => {
    if (mounted) {
      setSearchQuery("");
      setShowSearchResults(false);
      clearLibraries(); // 선택된 책 및 도서관 목록 초기화
    }
  }, [mode, mounted]);

  // Hydration 에러 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  const { getRegionCode, selectedRegion } = useRegionStore();
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
  } = useBookSearch();
  const { loadLibraries } = useMapStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await searchBooks({ query: searchQuery });
    setShowSearchResults(true);
  };

  const handleCategorySearch = async (keyword: string, kdc?: string) => {
    setSearchQuery(keyword);
    if (kdc) {
      await searchByKdc(kdc, keyword);
    } else {
      await searchBooks({ query: keyword });
    }
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

  const handleBookSelect = async (book: Book) => {
    selectBook(book);
    setShowSearchResults(false);
    const regionCode = getRegionCode();
    if (!regionCode) {
      alert("먼저 검색할 지역을 선택해주세요!");
      return;
    }
    const targetIsbn = book.isbn13 || book.isbn;
    if (targetIsbn) {
      await searchLibrariesWithBook(targetIsbn, regionCode);
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

  useEffect(() => {
    const regionCode = getRegionCode();
    if (regionCode) {
      loadLibraries(regionCode);
    }
  }, [selectedRegion, getRegionCode, loadLibraries]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <LibraryIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">우리 가족 <span className="text-purple-600">도서관</span></h1>
                <p className="text-xs font-medium text-gray-500">아이부터 할머니까지, 모두의 책방</p>
              </div>
            </div>

            <div className="flex bg-gray-100/80 rounded-2xl p-1 border border-gray-200/50">
              <button
                onClick={() => setMode('kids')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  mode === 'kids' ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                🧸 아이책
              </button>
              <button
                onClick={() => setMode('general')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  mode === 'general' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                👨‍👩‍👧‍👦 가족전체
              </button>
            </div>
          </div>

          <div className="bg-white/50 rounded-2xl p-1">
            <RegionSelector />
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={config.placeholder}
                className="pl-12 pr-24 h-14 rounded-2xl border-2 border-gray-100 bg-white shadow-md focus:border-purple-200 focus:ring-purple-100 text-base font-medium transition-all"
              />
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md shadow-purple-100"
              >
                {loading ? "찾는 중..." : "찾기"}
              </Button>
            </div>
          </form>

          {mode === 'kids' && <AgeFilter />}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-2xl mx-auto pb-20">
        {selectedBook && (
          <div className="mx-4 mt-6 p-6 bg-white rounded-[2rem] border-2 border-purple-50 shadow-xl shadow-purple-100/50 relative transition-all animate-in zoom-in-95 duration-300">
            <button onClick={clearLibraries} className="absolute -top-2 -right-2 p-2 bg-white text-gray-400 hover:text-gray-600 shadow-lg border border-gray-100 rounded-full transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-6 mb-6">
              {selectedBook.bookImageURL ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-200 rounded-2xl rotate-3 scale-95 opacity-50 group-hover:rotate-6 transition-transform" />
                  <img src={selectedBook.bookImageURL} alt={selectedBook.title} className="relative w-28 h-40 object-cover rounded-2xl shadow-lg shrink-0" />
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
                <h3 className="font-extrabold text-2xl text-gray-900 leading-tight mb-2 line-clamp-2">{selectedBook.title}</h3>
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
                <p className="text-[15px] text-gray-800 leading-[1.8] font-medium tracking-tight">
                    {selectedBook.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mx-4 mt-6 h-[350px] rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 relative">
          <LibraryMap libraries={selectedBook ? librariesWithBook : undefined} />
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
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg"><LibraryIcon className="w-5 h-5 text-green-600" /></div>
                <span>빌릴 수 있는 곳</span>
                {librariesWithBook.length > 0 && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-bold">{librariesWithBook.length}</span>}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleDeepScan} className="text-xs font-bold text-blue-600 h-9 px-3 hover:bg-blue-50 rounded-xl border border-blue-100 shadow-sm">🔎 근처 더 찾아보기</Button>
            </div>
            {librariesLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
            ) : librariesWithBook.length > 0 ? (
              <div className="space-y-4">
                {librariesWithBook.map((lib) => (
                  <div key={lib.libCode} className="p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1">{lib.libName}</h3>
                        {lib.address && <div className="flex items-center gap-1 text-gray-500 mb-2"><MapPin className="w-3 h-3 shrink-0" /><p className="text-xs truncate font-medium">{lib.address}</p></div>}
                        
                        {/* 가족 방문 가이드 (매뉴얼 기반 편의 정보) */}
                        <div className="flex flex-wrap gap-2 mb-3">
                           <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-black">평일 오전 방문 권장 ✨</span>
                           <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black">유아 자료실 보유</span>
                        </div>

                        {lib.homepage && <a href={lib.homepage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-600 rounded-lg border border-gray-200">도서관 홈페이지 가기</a>}
                      </div>
                      <div className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-xs font-black shrink-0 border", lib.loanAvailable ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                        {lib.loanAvailable ? <><CheckCircle2 className="w-5 h-5 mb-1" /><span>대출가능!</span></> : <><XCircle className="w-5 h-5 mb-1" /><span>대출중</span></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                <Button onClick={handleDeepScan} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold">🔎 모든 도서관 정밀 찾기</Button>
              </div>
            )}
          </div>
        )}

        {showSearchResults && books.length > 0 && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowSearchResults(false)} />
            <div className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] max-h-[75vh] bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="font-extrabold text-gray-900">검색 결과 ({books.length})</span>
                <button onClick={() => setShowSearchResults(false)} className="p-2 bg-gray-50 text-gray-400 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
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

        {!selectedBook && !showSearchResults && (
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
            </div>
          )
        )}
      </main>

      <SmartFinderModal isOpen={showSmartFinder} onClose={() => setShowSmartFinder(false)} onSearch={handleSmartSearch} />
    </div>
  );
}