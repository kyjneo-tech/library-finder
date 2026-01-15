import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const cookieStore = await cookies(); // await for Next.js 15+ compatibility
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { localStamps } = await request.json();

    // 1. Ensure UserProfile exists
    await prisma.userProfile.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        name: user.user_metadata.full_name || user.user_metadata.name,
        avatarUrl: user.user_metadata.avatar_url || user.user_metadata.picture,
        // Update other fields if needed
      },
      create: {
        id: user.id,
        email: user.email!, // Assuming email exists
        name: user.user_metadata.full_name || user.user_metadata.name,
        avatarUrl: user.user_metadata.avatar_url || user.user_metadata.picture,
        provider: user.app_metadata.provider || 'email',
      },
    });

    // 2. Upsert local stamps
    // This is a naive one-by-one upsert or transaction. Batching is better but Prisma createMany doesn't support upsert easily in all DBs (Postgres does with specific syntax, but Prisma standard 'upsert' is single).
    // For now, let's use a transaction.
    
    if (localStamps && localStamps.length > 0) {
      await prisma.$transaction(
        localStamps.map((stamp: any) => 
          prisma.readStamp.upsert({
            where: {
              userId_isbn: {
                userId: user.id,
                isbn: stamp.isbn,
              }
            },
            update: {
              // Only update if local is newer? For now, we trust local on first sync or just overwrite.
              // Let's assume overwrite or merge emoji if null.
              emoji: stamp.emoji,
              title: stamp.title,
              bookImage: stamp.bookImageUrl,
              author: stamp.author,
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              isbn: stamp.isbn,
              title: stamp.title,
              author: stamp.author,
              bookImage: stamp.bookImageUrl,
              emoji: stamp.emoji,
              createdAt: stamp.createdAt ? new Date(stamp.createdAt) : new Date(),
            }
          })
        )
      );
    }

    // 3. Fetch all stamps from server to return to client (Sync back)
    const serverStamps = await prisma.readStamp.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to client shape
    const stamps = serverStamps.map((s: { isbn: string; title: string; author: string | null; bookImage: string | null; emoji: string | null; createdAt: Date }) => ({
      isbn: s.isbn,
      title: s.title,
      author: s.author || undefined,
      bookImageUrl: s.bookImage || undefined,
      emoji: s.emoji || undefined,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ stamps });

  } catch (e) {
    console.error('Sync failed:', e);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
