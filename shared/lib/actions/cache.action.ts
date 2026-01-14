'use server';

import { prisma } from '../prisma';

// --- Book Cover Cache ---

/**
 * DB에서 책 표지 이미지 조회 (Server Action)
 */
export async function getCachedCoverFromDB(isbn: string): Promise<string | null> {
  try {
    if (!isbn) return null;

    const cached = await prisma.cachedBookCover.findUnique({
      where: { isbn },
    });
    
    return cached?.imageUrl || null;
  } catch (error) {
    console.error('DB Fetch Error (Cover):', error);
    return null;
  }
}

/**
 * DB에 책 표지 이미지 저장 (Server Action)
 */
export async function saveCoverToDB(isbn: string, imageUrl: string): Promise<void> {
  try {
    if (!isbn || !imageUrl) return;

    await prisma.cachedBookCover.upsert({
      where: { isbn },
      update: { imageUrl },
      create: { isbn, imageUrl },
    });
  } catch (error) {
    console.error('DB Save Error (Cover):', error);
  }
}

// --- Generic Data Cache (Popular Books, Libraries) ---

/**
 * 인기도서/신착도서 캐시 조회
 */
export async function getCachedPopularBooksFromDB(category: string, regionCode: string = 'ALL') {
  try {
    const cached = await prisma.cachedPopularBook.findFirst({
      where: {
        category,
        regionCode,
        expiresAt: { gt: new Date() } // 만료되지 않은 것만
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return cached?.bookData ? JSON.parse(JSON.stringify(cached.bookData)) : null;
  } catch (error) {
    console.error('DB Fetch Error (Popular):', error);
    return null;
  }
}

/**
 * 인기도서/신착도서 캐시 저장
 */
export async function savePopularBooksToDB(category: string, data: any, regionCode: string = 'ALL', ttlSeconds: number = 3600) {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    
    // 기존 캐시 만료처리 하거나 새로 생성 (복잡성을 줄이기 위해 단순 생성 후 주기적 청소 가정, 또는 row 교체)
    // 여기서는 가장 최신 1개만 유지하기 위해 기존 것 삭제 후 생성 (Transaction)
    await prisma.$transaction(async (tx: any) => {
        // 해당 카테고리/지역의 기존 캐시 삭제 (혹은 만료된 것 삭제)
        await tx.cachedPopularBook.deleteMany({
            where: { category, regionCode }
        });

        await tx.cachedPopularBook.create({
            data: {
                category,
                regionCode,
                bookData: data,
                expiresAt
            }
        });
    });

  } catch (error) {
    console.error('DB Save Error (Popular):', error);
  }
}

/**
 * 도서관 정보 캐시 조회
 */
export async function getCachedLibraryFromDB(libCode: string) {
    try {
        const cached = await prisma.cachedLibrary.findUnique({
            where: { libCode }
        });
        return cached;
    } catch {
        return null;
    }
}

/**
 * 도서관 정보 캐시 저장
 */
export async function saveLibraryToDB(libCode: string, info: any) {
    try {
        await prisma.cachedLibrary.upsert({
            where: { libCode },
            create: {
                libCode,
                libName: info.libName,
                address: info.address || info.addr,
                tel: info.tel,
                homepage: info.homepage,
                latitude: info.latitude,
                longitude: info.longitude
            },
            update: {
                libName: info.libName, // 이름 등 변경사항 반영
                updatedAt: new Date()
            }
        });
    } catch (e) {
        console.error('DB Save Library Error:', e);
    }
}
