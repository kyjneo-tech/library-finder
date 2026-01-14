import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '@/entities/book/model/types';
import { Library } from '@/entities/library/model/types';

interface FavoritesState {
  favoriteBooks: Book[];
  favoriteLibraries: Library[];

  // 도서 관련
  addBook: (book: Book) => void;
  removeBook: (isbn: string) => void;
  isBookFavorite: (isbn: string) => boolean;

  // 도서관 관련
  addLibrary: (library: Library) => void;
  removeLibrary: (libCode: string) => void;
  isLibraryFavorite: (libCode: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteBooks: [],
      favoriteLibraries: [],

      addBook: (book) => {
        const { favoriteBooks } = get();
        if (!favoriteBooks.some((b) => (b.isbn13 || b.isbn) === (book.isbn13 || book.isbn))) {
          set({ favoriteBooks: [...favoriteBooks, book] });
        }
      },

      removeBook: (isbn) => {
        set((state) => ({
          favoriteBooks: state.favoriteBooks.filter((b) => (b.isbn13 || b.isbn) !== isbn),
        }));
      },

      isBookFavorite: (isbn) => {
        return get().favoriteBooks.some((b) => (b.isbn13 || b.isbn) === isbn);
      },

      addLibrary: (library) => {
        const { favoriteLibraries } = get();
        if (!favoriteLibraries.some((l) => l.libCode === library.libCode)) {
          set({ favoriteLibraries: [...favoriteLibraries, library] });
        }
      },

      removeLibrary: (libCode) => {
        set((state) => ({
          favoriteLibraries: state.favoriteLibraries.filter((l) => l.libCode !== libCode),
        }));
      },

      isLibraryFavorite: (libCode) => {
        return get().favoriteLibraries.some((l) => l.libCode === libCode);
      },
    }),
    {
      name: 'library-favorites-storage',
    }
  )
);
