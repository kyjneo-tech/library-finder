import { Metadata } from "next";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";
import { BookDetailClient } from "./book-detail-client";
import { Card, CardContent } from "@/shared/ui/card";
import { BookOpen } from "lucide-react";

interface BookDetailPageProps {
  params: Promise<{ isbn: string }>;
}

export async function generateMetadata({ params }: BookDetailPageProps): Promise<Metadata> {
  const { isbn } = await params;
  const book = await bookRepository.getBookDetail(isbn);

  if (!book) {
    return {
      title: "책을 찾을 수 없습니다",
    };
  }

  return {
    title: `${book.title} - 우리 가족 도서관`,
    description: book.description || `${book.author}의 ${book.title}. 우리 동네 도서관에서 대출 가능 여부를 확인하세요.`,
    openGraph: {
      title: book.title,
      description: book.description || `${book.author}의 ${book.title}`,
      type: "book",
      authors: book.author ? [book.author] : [],
    },
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { isbn } = await params;
  const book = await bookRepository.getBookDetail(isbn);
  const availability = await bookRepository.getLibrariesWithBook(isbn);

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-semibold mb-2">책을 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">ISBN: {isbn}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <BookDetailClient book={book} availability={availability} />;
}
