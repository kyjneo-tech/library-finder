'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library as LibraryIcon, Search, Sparkles, Home } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { RegionSelector } from '@/features/region-selector/ui/region-selector';
import { AgeFilter } from '@/features/kids-mode/ui/age-filter';
import { useSearchMode } from '@/features/search-mode/lib/use-search-mode';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { useMapStore } from '@/features/library-map/lib/use-map-store';
import { useLibrarySearch } from '@/features/library/lib/use-library-search';
import { useBookSearch } from '@/features/book-search/lib/use-book-search';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { useReadingRecord } from '@/features/reading-record/lib/use-reading-record';
import { useAgeFilter } from '@/features/kids-mode/lib/use-age-filter';
import { LoginButton } from '@/features/auth/ui/login-button';
import { UserMenu } from '@/features/auth/ui/user-menu';
import Link from 'next/link';
import { Logo } from '@/shared/ui/logo';

interface HomeHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  loading: boolean;
  config: any;
  setShowSearchResults: (show: boolean) => void;
}

export function HomeHeader({
  searchQuery,
  setSearchQuery,
  handleSearch,
  loading,
  config,
  setShowSearchResults,
}: HomeHeaderProps) {
  const { mode, setMode } = useSearchMode();
  const { reset: resetRegion } = useRegionStore();
  const { clearLibraries } = useLibrarySearch();
  const { clearSearch } = useBookSearch();
  const { setSelectedLibrary } = useMapStore();

  const handleReset = () => {
    clearLibraries();
    clearSearch();
    setSelectedLibrary(null);
    setShowSearchResults(false);
    setSearchQuery('');
    resetRegion();
  };

  const handleTabChange = (newMode: 'kids' | 'general') => {
    // 탭 전환 시: 지역(Region)은 유지하고 나머지 상태(검색, 선택된 책 등)만 초기화
    if (newMode === mode) return; // 같은 탭이면 무시

    clearLibraries();
    clearSearch();
    setSelectedLibrary(null);
    setShowSearchResults(false);
    setSearchQuery('');
    // resetRegion(); // 👈 지역은 유지!
    
    setMode(newMode);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  const { user, initialize } = useAuthStore();
  const { syncWithServer } = useReadingRecord();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      syncWithServer();
    }
  }, [user, syncWithServer]);

  return (
    <motion.header
      className="sticky top-0 z-30 glass border-b border-white/50 shadow-premium"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 relative">
        {/* 🔥 3초 설득 헤드라인 - FIRST! */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-1">
            아직도 책 사서 보세요?
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            우리 동네 도서관에서 <span className="text-purple-600 font-bold">0원</span>에 빌리세요
          </p>
        </motion.div>

        {/* 로고 + 로그인 (작게) */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white p-1"
              whileHover={{ rotate: 5 }}
            >
              <Logo className="w-full h-full" />
            </motion.div>
            <div>
              <h1 className="text-base font-extrabold bg-gradient-to-r from-wisdom-600 to-warmth-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                우리도서관
              </h1>
            </div>
          </motion.button>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/my-bookshelf">
                  <Button variant="ghost" className="hidden sm:flex items-center gap-1.5 text-gray-600 font-medium hover:bg-purple-50 hover:text-purple-600 text-sm">
                    <LibraryIcon className="w-4 h-4" />
                    <span>내 서재</span>
                  </Button>
                </Link>
                <UserMenu />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </motion.div>
        
        {/* 모드 탭 (직관적 라벨) */}
        <div className="flex bg-white/60 backdrop-blur-lg rounded-2xl p-1 border border-wisdom-100/50 shadow-sm w-full" role="tablist">
          <motion.button
            onClick={() => handleTabChange('kids')}
            role="tab"
            aria-selected={mode === 'kids'}
            className={cn(
              'flex-1 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative overflow-hidden flex items-center justify-center gap-1.5',
              mode === 'kids'
                ? 'bg-gradient-hero text-white shadow-glow-warmth'
                : 'text-gray-600 hover:text-warmth-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
             {mode === 'kids' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">아동도서</span>
            </motion.button>
            <motion.button
              onClick={() => handleTabChange('general')}
              role="tab"
              aria-selected={mode === 'general'}
              className={cn(
                'flex-1 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative overflow-hidden flex items-center justify-center gap-1.5',
                mode === 'general'
                  ? 'bg-gradient-purple text-white shadow-glow-purple'
                  : 'text-gray-600 hover:text-wisdom-600'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mode === 'general' && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Home className="w-4 h-4 relative z-10" />
              <span className="relative z-10">전체</span>
            </motion.button>
          </div>

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
            transition={{ type: 'spring', stiffness: 300 }}
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
                {loading ? '찾는 중...' : '찾기'}
              </Button>
            </motion.div>
          </motion.div>
        </motion.form>

        {/* ✅ Trust Badges */}
        <motion.div
          className="flex items-center justify-center gap-4 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="flex items-center gap-1 text-gray-500 font-medium">
            <span className="text-green-500">✓</span> 무료
          </span>
          <span className="flex items-center gap-1 text-gray-500 font-medium">
            <span className="text-green-500">✓</span> 가입 없이 검색
          </span>
          <span className="flex items-center gap-1 text-gray-500 font-medium">
            <span className="text-green-500">✓</span> 실시간 재고
          </span>
        </motion.div>

        {mode === 'kids' && <AgeFilter />}
      </div>
    </motion.header>
  );
}
