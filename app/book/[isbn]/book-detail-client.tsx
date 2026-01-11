"use client";

import { motion, useInView } from "framer-motion";
import { BookOpen, User, Calendar, Building2, TrendingUp } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Book } from "@/entities/book/model/types";
import { staggerContainer, staggerItem, floatingCard } from "@/shared/lib/animations/variants";

interface BookDetailClientProps {
  book: Book;
  availability: {
    totalCount: number;
    libraries: Array<{
      libraryName: string;
      libraryCode: string;
      isbn: string;
      loanAvailable: boolean;
      returnDate?: string;
    }>;
  };
}

function CountUpAnimation({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const duration = 1500; // 1.5초

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // easeOut 효과
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, isInView]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function BookDetailClient({ book, availability }: BookDetailClientProps) {
  return (
    <div className="min-h-screen bg-gradient-soft relative overflow-hidden pb-20">
      {/* 🎨 배경 블롭 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-warmth-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-80 -left-40 w-80 h-80 bg-wisdom-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto p-4 space-y-6 relative z-10">
        {/* 책 히어로 섹션 */}
        <motion.div
          variants={floatingCard}
          initial="initial"
          animate="animate"
        >
          <Card className="glass border-white/50 shadow-premium overflow-hidden">
            {/* 동적 그라데이션 배경 */}
            <div className="absolute inset-0 bg-gradient-to-br from-warmth-50 via-white to-wisdom-50 opacity-60" />

            <CardHeader className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* 책 표지 */}
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {book.bookImageURL ? (
                    <img
                      src={book.bookImageURL}
                      alt={book.title}
                      className="w-40 h-56 sm:w-48 sm:h-64 object-cover rounded-2xl shadow-premium border-2 border-white/50"
                    />
                  ) : (
                    <div className="w-40 h-56 sm:w-48 sm:h-64 bg-gradient-to-br from-warmth-100 to-wisdom-100 rounded-2xl flex items-center justify-center shadow-premium">
                      <BookOpen className="w-20 h-20 text-warmth-400" />
                    </div>
                  )}
                </motion.div>

                {/* 책 정보 */}
                <div className="flex-1 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-warmth-600 to-wisdom-600 bg-clip-text text-transparent leading-tight">
                      {book.title}
                    </CardTitle>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {book.author && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-5 h-5 text-warmth-500" />
                        <span className="font-medium">{book.author}</span>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-5 h-5 text-wisdom-500" />
                        <span className="font-medium">{book.publisher}</span>
                      </div>
                    )}
                    {book.publishYear && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5 text-growth-500" />
                        <span className="font-medium">{book.publishYear}</span>
                      </div>
                    )}
                  </motion.div>

                  {/* 배지 & 통계 */}
                  <motion.div
                    className="flex gap-2 flex-wrap pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {book.className && (
                      <Badge className="bg-gradient-purple text-white border-0 shadow-glow-purple">
                        {book.className}
                      </Badge>
                    )}
                    {book.loanCnt && book.loanCnt > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge className="bg-gradient-to-r from-warmth-500 to-warmth-600 text-white border-0 shadow-lg flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          대출 <CountUpAnimation end={book.loanCnt} suffix="회" />
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </CardHeader>

            {book.description && (
              <CardContent className="relative z-10">
                <motion.p
                  className="text-sm sm:text-base text-gray-700 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {book.description}
                </motion.p>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* 소장 도서관 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/50 shadow-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  이 책을 소장한 도서관
                </CardTitle>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                >
                  <Badge className="bg-gradient-purple text-white text-lg px-4 py-1 shadow-glow-purple">
                    <CountUpAnimation end={availability.totalCount} />
                  </Badge>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent>
              {availability.libraries.length === 0 ? (
                <motion.div
                  className="text-center py-12 bg-white/50 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    현재 이 책을 소장한 도서관이 없습니다
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {availability.libraries.map((lib, idx) => (
                    <motion.div
                      key={`${lib.libraryCode}-${lib.isbn}`}
                      className="p-5 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm will-change-transform"
                      variants={staggerItem}
                      whileHover={{
                        y: -4,
                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {/* 순서 배지 */}
                        <motion.div
                          className="w-8 h-8 bg-gradient-purple rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          {idx + 1}
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-gray-800">{lib.libraryName}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            코드: {lib.libraryCode}
                          </p>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.05 }}>
                        {lib.loanAvailable ? (
                          <Badge className="bg-gradient-to-r from-growth-500 to-growth-600 text-white border-0 shadow-md">
                            ✅ 대출 가능
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-red-400 to-red-500 text-white border-0 shadow-md">
                            ⏳ 대출 중
                            {lib.returnDate && (
                              <span className="ml-1 text-xs opacity-90">
                                ({lib.returnDate} 반납)
                              </span>
                            )}
                          </Badge>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
