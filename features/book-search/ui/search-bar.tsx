"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";
import { useBookSearch } from "../lib/use-book-search";
import { cn } from "@/shared/lib/cn";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoSearch?: boolean;
}

export function SearchBar({
  className,
  placeholder = "책 제목, 저자 검색...",
  autoSearch = true,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const { searchBooks, clearSearch } = useBookSearch();

  useEffect(() => {
    if (autoSearch && debouncedQuery) {
      searchBooks({ query: debouncedQuery });
    } else if (!debouncedQuery) {
      clearSearch();
    }
  }, [debouncedQuery, autoSearch, searchBooks, clearSearch]);

  const handleClear = () => {
    setQuery("");
    clearSearch();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchBooks({ query });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full flex items-center gap-2", className)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {!autoSearch && (
        <Button type="submit" size="icon">
          <Search className="w-4 h-4" />
        </Button>
      )}
    </form>
  );
}
