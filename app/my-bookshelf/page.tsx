import { Metadata } from 'next';
import { MyBookshelfClient } from './my-bookshelf-client';

export const metadata: Metadata = {
  title: '내 책장 - 우리 가족 도서관',
  description: '내가 읽은 책들을 모아보세요.',
};

export default function MyBookshelfPage() {
  return <MyBookshelfClient />;
}
