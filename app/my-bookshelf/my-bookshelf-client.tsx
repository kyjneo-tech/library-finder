'use client';

import { motion } from 'framer-motion';
import { useReadingRecord } from '@/features/reading-record/lib/use-reading-record';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { BookOpen, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { ReadStampButton } from '@/features/reading-record/ui/read-stamp-button';
import Link from 'next/link';

export function MyBookshelfClient() {
  const { stamps } = useReadingRecord();
  const { user } = useAuthStore();

  const sortedStamps = [...stamps].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📚</span>
            <h1 className="text-2xl font-black text-gray-900">내 책장</h1>
          </div>
          <p className="text-gray-500 text-sm">
            {user 
              ? `${user.user_metadata?.full_name || '사용자'}님의 독서 기록입니다.` 
              : '로그인하면 독서 기록을 평생 간직할 수 있어요!'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 통계 요약 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-purple-600 mb-1">{stamps.length}</span>
              <span className="text-xs text-gray-500 font-bold">읽은 책</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-warmth-600 mb-1">
                {stamps.filter(s => s.emoji === '❤️').length}
              </span>
              <span className="text-xs text-gray-500 font-bold">인생 책</span>
            </CardContent>
          </Card>
           {/* 추후 추가 통계: 이번 달 읽은 책 등 */}
        </div>

        {stamps.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-bold mb-4">아직 읽은 책이 없어요</p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-purple text-white font-bold rounded-xl shadow-glow-purple hover:scale-105 transition-transform"
            >
              책 찾으러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedStamps.map((stamp, idx) => (
              <motion.div
                key={stamp.isbn}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-white/50">
                  <div className="flex p-4 gap-4">
                    <div className="shrink-0 w-20 h-28 bg-gray-100 rounded-lg overflow-hidden relative shadow-sm">
                      {stamp.bookImageUrl ? (
                        <img 
                          src={stamp.bookImageUrl} 
                          alt={stamp.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-sm">
                        {stamp.emoji}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-gray-900 truncate mb-1">{stamp.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{stamp.author}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          {new Date(stamp.createdAt).toLocaleDateString()}
                        </div>
                        <div className="scale-90 origin-right">
                           <ReadStampButton 
                              book={{
                                isbn: stamp.isbn,
                                title: stamp.title,
                                author: stamp.author || '',
                                image: stamp.bookImageUrl || '',
                              }}
                           />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
