import { Metadata } from "next";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { BookOpen, User, Calendar, Building2 } from "lucide-react";

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
    title: `${book.title} - 우리동네 도서관`,
    description: book.description || `${book.author}의 ${book.title}`,
    openGraph: {
      title: book.title,
      description: book.description,
      images: book.bookImageURL ? [book.bookImageURL] : [],
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

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* 책 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            {book.bookImageURL ? (
              <img
                src={book.bookImageURL}
                alt={book.title}
                className="w-32 h-48 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-32 h-48 bg-muted rounded-lg flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl">{book.title}</CardTitle>
              {book.author && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{book.author}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.publishYear && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{book.publishYear}</span>
                </div>
              )}
              <div className="flex gap-1 flex-wrap pt-2">
                {book.className && <Badge variant="outline">{book.className}</Badge>}
                {book.loanCnt && book.loanCnt > 0 && (
                  <Badge variant="secondary">대출 {book.loanCnt}회</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        {book.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
          </CardContent>
        )}
      </Card>

      {/* 소장 도서관 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>이 책을 소장한 도서관 ({availability.totalCount})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availability.libraries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              현재 이 책을 소장한 도서관이 없습니다
            </p>
          ) : (
            availability.libraries.map((lib) => (
              <div
                key={`${lib.libraryCode}-${lib.isbn}`}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">{lib.libraryName}</h3>
                  <p className="text-sm text-muted-foreground">
                    도서관 코드: {lib.libraryCode}
                  </p>
                </div>
                <div>
                  {lib.loanAvailable ? (
                    <Badge variant="default">대출 가능</Badge>
                  ) : (
                    <Badge variant="destructive">
                      대출 중{lib.returnDate && ` (${lib.returnDate} 반납 예정)`}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
