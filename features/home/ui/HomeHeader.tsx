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
import { LoginButton } from '@/features/auth/ui/login-button';
import { UserMenu } from '@/features/auth/ui/user-menu';

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
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 relative">
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
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-purple rounded-2xl flex items-center justify-center shadow-glow-purple relative overflow-hidden"
              animate={{
                boxShadow: [
                  '0 8px 32px rgba(168, 85, 247, 0.25)',
                  '0 8px 32px rgba(168, 85, 247, 0.4)',
                  '0 8px 32px rgba(168, 85, 247, 0.25)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <LibraryIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-wisdom-600 to-warmth-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                우리도서관
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 hidden sm:block">
                내 손안의 공공도서관
              </p>
            </div>
          </motion.button>

          <div className="flex items-center gap-2">
            {/* 로그인 / 유저 메뉴 */}
            {user ? <UserMenu /> : <LoginButton />}
          </div>
        </motion.div>
        
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
              <span className="relative z-10">우리 아이</span>
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
              <span className="relative z-10">우리 모두</span>
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
        {mode === 'kids' && <AgeFilter />}
      </div>
    </motion.header>
  );
}
