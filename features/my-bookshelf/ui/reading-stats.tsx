'use client';

import { useMemo } from 'react';
import { useReadingRecord } from '@/features/reading-record/lib/use-reading-record';
import { BookOpen, TrendingUp } from 'lucide-react';

interface ReadingStatsProps {
  childId?: string;
  childName?: string;
}

export function ReadingStats({ childId, childName }: ReadingStatsProps) {
  const { stamps } = useReadingRecord();

  const stats = useMemo(() => {
    // Filter by childId if provided
    const filtered = childId 
      ? stamps.filter(s => s.childId === childId)
      : stamps.filter(s => !s.childId); // Inbox (no childId)

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthCount = filtered.filter(s => {
      const d = new Date(s.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // This week (Sunday-Saturday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekCount = filtered.filter(s => {
      const d = new Date(s.createdAt);
      return d >= startOfWeek;
    }).length;

    return {
      total: filtered.length,
      thisMonth: thisMonthCount,
      thisWeek: thisWeekCount,
    };
  }, [stamps, childId]);

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pop-yellow rounded-xl flex items-center justify-center border-2 border-black">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black">{childName || '내'} 서재</h2>
            <p className="text-sm text-stone-500 font-medium">총 {stats.total}권의 책</p>
          </div>
        </div>
        
        <div className="flex gap-4 text-center">
          <div className="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
            <div className="text-2xl font-black text-pop-blue">{stats.thisMonth}</div>
            <div className="text-xs text-stone-500 font-bold">이번 달</div>
          </div>
          <div className="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
            <div className="text-2xl font-black text-pop-green">{stats.thisWeek}</div>
            <div className="text-xs text-stone-500 font-bold">이번 주</div>
          </div>
        </div>
      </div>
    </div>
  );
}
