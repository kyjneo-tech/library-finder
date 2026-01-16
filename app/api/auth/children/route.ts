import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List children (Optional if /api/auth/me handles it, but good for specific fetching)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const children = await prisma.childProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a child
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, birthYear, emoji } = body;

    if (!name || !birthYear) {
      return NextResponse.json({ error: 'Name and Birth Year are required' }, { status: 400 });
    }

    const child = await prisma.childProfile.create({
      data: {
        userId: session.user.id,
        name,
        birthYear: parseInt(birthYear),
        emoji: emoji || '🐥',
      }
    });

    return NextResponse.json({ child });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a child
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    // Verify ownership
    const child = await prisma.childProfile.findUnique({
      where: { id },
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    if (child.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized operation' }, { status: 403 });
    }

    // Delete
    await prisma.childProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
