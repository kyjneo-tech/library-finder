'use client';

import { Library } from '@/entities/library/model/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface LibraryCardProps {
  library: Library;
  distance?: number; // 미터 단위
  onClick?: () => void;
}

export function LibraryCard({ library, distance, onClick }: LibraryCardProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{library.libName}</CardTitle>
            {library.address && (
              <CardDescription className="flex items-start gap-1 mt-1">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{library.address}</span>
              </CardDescription>
            )}
          </div>
          {distance !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {formatDistance(distance)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {library.tel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{library.tel}</span>
          </div>
        )}
        {library.operatingTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{library.operatingTime}</span>
          </div>
        )}
        <div className="flex gap-1 flex-wrap">
          {library.libraryType && <Badge variant="outline">{library.libraryType}</Badge>}
          {library.bookCount && (
            <Badge variant="outline">장서 {library.bookCount.toLocaleString()}권</Badge>
          )}
        </div>
        {library.homepage && (
          <Link
            href={library.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            홈페이지
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
