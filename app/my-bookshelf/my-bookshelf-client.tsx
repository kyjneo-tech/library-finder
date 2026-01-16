'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadingRecord } from '@/features/reading-record/lib/use-reading-record';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { useFamilyStore } from '@/features/family/model/use-family-store';
import { BookOpen, Plus, CheckCircle2, Trash2, Gift, Library, Menu, Settings, LogOut, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { AddChildDialog } from '@/features/auth/ui/add-child-dialog';
import { FamilyManagerDialog } from '@/features/family/ui/family-manager-dialog';
import { ReadingStats } from '@/features/my-bookshelf/ui/reading-stats';
import { BookListItem } from '@/features/my-bookshelf/ui/book-list-item';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/ui/dropdown-menu';
import Link from 'next/link';
import { Logo } from '@/shared/ui/logo';
import { cn } from '@/shared/lib/cn';

export function MyBookshelfClient() {
  const { stamps, moveStampsToChild, removeStamp } = useReadingRecord();
  const { members, fetchMembers } = useFamilyStore();
  const { user, signOut } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('inbox');
  const [isFamilyManagerOpen, setIsFamilyManagerOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIsbns, setSelectedIsbns] = useState<Set<string>>(new Set());
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Filter Stamps Logic
  const filteredStamps = useMemo(() => {
    const sorted = [...stamps].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (activeTab === 'inbox') {
      return sorted.filter(s => !s.childId);
    }
    return sorted.filter(s => s.childId === activeTab);
  }, [stamps, activeTab]);

  const toggleSelection = (isbn: string) => {
    const newSet = new Set(selectedIsbns);
    if (newSet.has(isbn)) {
      newSet.delete(isbn);
    } else {
      newSet.add(isbn);
    }
    setSelectedIsbns(newSet);
  };

  const currentChild = members.find(c => c.id === activeTab);
  const isInbox = activeTab === 'inbox';

  const handleMove = async (targetChildId: string) => {
    if (selectedIsbns.size === 0) return;
    try {
      const sourceChildId = activeTab === 'inbox' ? undefined : activeTab;
      await moveStampsToChild(Array.from(selectedIsbns), targetChildId, sourceChildId);
      setIsSelectionMode(false);
      setSelectedIsbns(new Set());
      setActiveTab(targetChildId);
    } catch (error) {
      console.error('Move failed', error);
    }
  };
  
  const handleDelete = () => {
     if (selectedIsbns.size === 0) return;
     if (confirm('정말 삭제하시겠습니까?')) {
       const targetId = activeTab === 'inbox' ? undefined : activeTab;
       selectedIsbns.forEach(isbn => removeStamp(isbn, targetId));
       setIsSelectionMode(false);
       setSelectedIsbns(new Set());
     }
  };

  return (
    <>
      {/* Main Content */}
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-2 border-stone-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between relative">
            {/* Left: Logo */}
            <Link href="/" className="bg-white border-2 border-black shadow-[2px_2px_0_0_#000] p-1.5 rounded-lg active:translate-y-[2px] active:shadow-none transition-all">
              <Logo className="w-6 h-6" />
            </Link>

            {/* Center: Profile Switcher */}
            <div className="absolute left-1/2 -translate-x-1/2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 transition-all outline-none active:translate-y-[2px] active:shadow-none">
                        <span className="text-xl">{isInbox ? '🏠' : currentChild?.emoji}</span>
                        <span className="font-black text-sm md:text-base max-w-[100px] truncate">
                           {isInbox ? '내 서재' : currentChild?.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                     </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-xl p-2 bg-white" align="center">
                      <DropdownMenuLabel className="text-xs text-stone-400 font-bold uppercase tracking-wider ml-2 mb-2">Switch Room</DropdownMenuLabel>
                      
                      <DropdownMenuItem 
                          onClick={() => setActiveTab('inbox')}
                          className={cn("font-bold cursor-pointer rounded-lg p-3 mb-1", activeTab === 'inbox' ? "bg-stone-100" : "hover:bg-purple-50")}
                      >
                         <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mr-3 border border-stone-200">
                            🏠
                         </div>
                         <span className="text-base">내 서재 (메인)</span>
                         {activeTab === 'inbox' && <CheckCircle2 className="ml-auto w-5 h-5 text-black" />}
                      </DropdownMenuItem>
                      
                      {members.map(member => (
                         <DropdownMenuItem 
                            key={member.id}
                            onClick={() => setActiveTab(member.id)}
                            className={cn("font-bold cursor-pointer rounded-lg p-3 mb-1", activeTab === member.id ? "bg-stone-100" : "hover:bg-purple-50")}
                         >
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 border-2 border-black shadow-[1px_1px_0_0_#000]">
                               {member.emoji}
                            </div>
                            <span className="text-base">{member.name}</span>
                            {activeTab === member.id && <CheckCircle2 className="ml-auto w-5 h-5 text-black" />}
                         </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="bg-stone-100 my-2" />
                      <DropdownMenuItem onClick={() => setIsAddChildOpen(true)} className="cursor-pointer font-bold text-pop-blue hover:bg-blue-50 rounded-lg p-3 justify-center border-2 border-dashed border-stone-200 hover:border-pop-blue transition-colors">
                         <Plus className="w-4 h-4 mr-2" /> 새 방 만들기
                      </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>

            {/* Right: Menu */}
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 h-auto hover:bg-stone-100 rounded-lg">
                     <Menu className="w-6 h-6" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-lg bg-white p-1">
                   <DropdownMenuItem onClick={() => setIsFamilyManagerOpen(true)} className="font-bold p-3 cursor-pointer hover:bg-stone-50 rounded-md">
                      <Users className="w-4 h-4 mr-2" /> 가족 관리
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => alert('설정 준비 중입니다!')} className="font-bold p-3 cursor-pointer hover:bg-stone-50 rounded-md">
                      <Settings className="w-4 h-4 mr-2" /> 설정
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-stone-100" />
                   <DropdownMenuItem onClick={() => signOut()} className="font-bold text-red-500 p-3 cursor-pointer hover:bg-red-50 rounded-md">
                      <LogOut className="w-4 h-4 mr-2" /> 로그아웃
                   </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
          {/* Stats Header */}
          <ReadingStats 
            childId={isInbox ? undefined : activeTab} 
            childName={currentChild?.name} 
          />

          {/* Book List */}
          {filteredStamps.length === 0 ? (
            <EmptyState isInbox={isInbox} childName={currentChild?.name} />
          ) : (
            <div className="space-y-3">
              {filteredStamps.map((stamp, idx) => (
                <motion.div
                  key={stamp.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <BookListItem
                    isbn={stamp.isbn}
                    title={stamp.title}
                    author={stamp.author}
                    imageUrl={stamp.bookImageUrl}
                    emoji={stamp.emoji}
                    createdAt={stamp.createdAt}
                    isSelected={selectedIsbns.has(stamp.isbn)}
                    isSelectionMode={isSelectionMode}
                    onToggle={() => toggleSelection(stamp.isbn)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selection Mode Bar */}
        <AnimatePresence>
          {isSelectionMode && selectedIsbns.size > 0 && (
            <motion.div 
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-black text-white p-4 pb-8 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="max-w-md mx-auto flex items-center justify-between">
                 <span className="font-bold text-lg">{selectedIsbns.size}권 선택됨</span>
                 <div className="flex gap-4">
                    <button onClick={handleDelete} className="p-2 bg-stone-800 rounded-full hover:bg-red-600 transition-colors">
                       <Trash2 className="w-6 h-6" />
                    </button>
                    <button 
                       onClick={() => { setIsSelectionMode(false); setSelectedIsbns(new Set()); }}
                       className="font-bold text-stone-400 hover:text-white"
                    >
                       취소
                    </button>
                     {(members.length > 0 && activeTab === 'inbox') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="bg-pop-blue border-2 border-black text-white hover:bg-blue-600 font-bold shadow-sm rounded-lg">
                               <Gift className="w-5 h-5 mr-2" /> 이동하기
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-2 border-black shadow-pop mb-4 ml-4">
                              {members.map(m => (
                                <DropdownMenuItem key={m.id} onClick={() => handleMove(m.id)} className="font-bold cursor-pointer hover:bg-pop-yellow focus:bg-pop-yellow">
                                  {m.emoji} {m.name}의 방으로 이동
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-28 right-8 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <AnimatePresence>
            {isFabOpen && (
              <>
                <motion.div
                   initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
                   transition={{ delay: 0.1 }}
                >
                  <Link href="/" className="flex items-center gap-2 bg-white border-2 border-black px-4 py-3 rounded-full shadow-pop hover:scale-105 transition-transform font-bold mb-1">
                     <span className="text-sm font-bold">책 추가</span>
                     <div className="bg-black text-white rounded-full p-2"><BookOpen className="w-4 h-4" /></div>
                  </Link>
                </motion.div>

                <motion.div
                   initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
                >
                   <button 
                      onClick={() => { setIsSelectionMode(!isSelectionMode); setIsFabOpen(false); }}
                      className="flex items-center gap-2 bg-pop-yellow border-2 border-black px-4 py-3 rounded-full shadow-pop hover:scale-105 transition-transform font-bold mb-1"
                   >
                      <span className="text-sm font-bold">{isSelectionMode ? '편집 종료' : '서재 편집'}</span>
                      <div className="bg-black text-white rounded-full p-2"><CheckCircle2 className="w-4 h-4" /></div>
                   </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          <button
             onClick={() => setIsFabOpen(!isFabOpen)}
             className={cn(
               "w-16 h-16 rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all",
               isFabOpen ? "bg-white text-black rotate-45" : "bg-black text-white hover:bg-stone-800"
             )}
          >
             <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>

      <AddChildDialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen} />
      <FamilyManagerDialog open={isFamilyManagerOpen} onOpenChange={setIsFamilyManagerOpen} />
    </>
  );
}

// Empty State Component
function EmptyState({ isInbox, childName }: { isInbox: boolean; childName?: string }) {
  return (
     <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] rounded-full flex items-center justify-center mb-6">
           <Library className="w-10 h-10 text-stone-400" />
        </div>
        <h3 className="text-xl font-black mb-2">
          {isInbox ? '아직 읽은 책이 없어요' : `${childName}의 방이 비어있어요`}
        </h3>
        <p className="text-stone-500 mb-8">
           책을 검색하고 "읽었어요"를 눌러보세요!
        </p>
        
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-4 font-black text-lg border-4 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0_0_#000] transition-all rounded-xl"
        >
           책 찾으러 가기 →
        </Link>
     </div>
  );
}
