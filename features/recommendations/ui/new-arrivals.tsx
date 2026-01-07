"use client";

import { useEffect } from "react";
import { useRecommendations } from "../lib/use-recommendations";
import { BookCard } from "@/features/book-search/ui/book-card";
import { Skeleton } from "@/shared/ui/skeleton";

export function NewArrivals() {
  const { newArrivals, loading, loadNewArrivals } = useRecommendations();

  useEffect(() => {
    if (newArrivals.length === 0) {
      loadNewArrivals();
    }
  }, [newArrivals.length, loadNewArrivals]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-4">📚 이번 주 신간</h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="min-w-[280px] h-[180px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (newArrivals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold px-4">📚 이번 주 신간</h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {newArrivals.map((book) => (
          <div key={book.isbn} className="min-w-[280px]">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
}
