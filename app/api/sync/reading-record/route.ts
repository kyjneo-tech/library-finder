import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma'; // Use singleton

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
    if (localStamps && localStamps.length > 0) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        for (const stamp of localStamps) {
          const targetChildId = stamp.childId || null;
          
          // 1. Try to find existing record
          // We use findFirst instead of findUnique to handle potential multiple nulls safely (though we want unique)
          // and to avoid the "null in unique input" error.
          const existing = await tx.readStamp.findFirst({
            where: {
              userId: user.id,
              isbn: stamp.isbn,
              childId: targetChildId,
            }
          });

          if (existing) {
            // 2. Update
            await tx.readStamp.update({
              where: { id: existing.id },
              data: {
                emoji: stamp.emoji,
                title: stamp.title,
                bookImage: stamp.bookImageUrl,
                author: stamp.author,
                updatedAt: new Date(),
              }
            });
          } else {
            // 3. Create
            await tx.readStamp.create({
              data: {
                userId: user.id,
                isbn: stamp.isbn,
                title: stamp.title,
                author: stamp.author || "작가 미상",
                bookImage: stamp.bookImageUrl,
                emoji: stamp.emoji,
                childId: targetChildId,
                createdAt: stamp.createdAt ? new Date(stamp.createdAt) : new Date(),
              }
            });
          }
        }
      }, {
        maxWait: 5000,
        timeout: 20000,
      });
    }

    // 3. Fetch all stamps from server to return to client
    const serverStamps = await prisma.readStamp.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to client shape
    const stamps = serverStamps.map((s: any) => ({
      isbn: s.isbn,
      title: s.title,
      author: s.author || undefined,
      bookImageUrl: s.bookImage || undefined,
      emoji: s.emoji || undefined,
      childId: s.childId || undefined,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ stamps });

  } catch (e: any) {
    console.error('Sync failed:', e);
    return NextResponse.json({ 
      error: 'Sync failed', 
      details: e?.message || String(e) 
    }, { status: 500 });
  }
}
