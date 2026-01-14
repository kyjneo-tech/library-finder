'use client';

import { Book } from '@/entities/book/model/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import Link from 'next/link';
import { BookOpen, User, Calendar } from 'lucide-react';

interface BookCardProps {
  book: Book;
  showAvailability?: boolean;
}

export function BookCard({ book, showAvailability = false }: BookCardProps) {
  return (
    <Link href={`/book/${book.isbn}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex gap-3">
            {book.bookImageURL ? (
              <img
                src={book.bookImageURL}
                alt={book.title}
                className="w-16 h-24 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
              {book.author && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <User className="w-3 h-3" />
                  <span className="text-xs">{book.author}</span>
                </CardDescription>
              )}
              {book.publishYear && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">{book.publishYear}</span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {book.className && <Badge variant="outline">{book.className}</Badge>}
            {book.loanCnt && book.loanCnt > 0 && (
              <Badge variant="secondary">대출 {book.loanCnt}회</Badge>
            )}
            {book.ranking && <Badge variant="default">#{book.ranking}</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
