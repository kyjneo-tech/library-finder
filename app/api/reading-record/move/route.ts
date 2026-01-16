import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isbns, targetChildId, sourceChildId } = await request.json();

    if (!isbns || !Array.isArray(isbns) || isbns.length === 0) {
      return NextResponse.json({ error: 'Invalid isbns' }, { status: 400 });
    }

    if (!targetChildId) {
      return NextResponse.json({ error: 'Target childId required' }, { status: 400 });
    }

    // Transaction: For each ISBN, "Move" = Copy to Target + Delete from Source (Inbox or specific child)
    await prisma.$transaction(async (tx: any) => {
      for (const isbn of isbns) {
        // 1. Get original stamp from Source
        const sourceWhere = {
          userId: session.user.id,
          isbn,
          childId: sourceChildId || null, // Default to Inbox if source not specified
        };

        const sourceStamp = await tx.readStamp.findFirst({
           where: sourceWhere
        });

        if (!sourceStamp) continue; // Skip if not found in source

        // 2. Upsert to Target Child
        await tx.readStamp.upsert({
          where: {
            userId_isbn_childId: {
              userId: session.user.id,
              isbn,
              childId: targetChildId,
            }
          },
          update: {
            // Merge metadata if needed, but usually keep target or source?
            // Let's overwrite with source metadata to preserve "what parent saved"
            emoji: sourceStamp.emoji,
            title: sourceStamp.title,
            bookImage: sourceStamp.bookImage,
            author: sourceStamp.author,
          },
          create: {
            userId: session.user.id,
            isbn,
            childId: targetChildId,
            title: sourceStamp.title,
            author: sourceStamp.author || "작가 미상",
            bookImage: sourceStamp.bookImage,
            emoji: sourceStamp.emoji,
            createdAt: sourceStamp.createdAt, // Preserve original timestamp
          }
        });

        // 3. Delete from Source
        // We use deleteMany to be safe with potential null handling, though unique constraint should allow delete.
        // But for safety with composite keys + nulls, findFirst + delete is robust.
        await tx.readStamp.deleteMany({
          where: sourceWhere
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
