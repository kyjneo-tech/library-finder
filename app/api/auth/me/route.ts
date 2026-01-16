import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;

  try {
    // Upsert Profile (Ensure it exists)
    const profile = await prisma.userProfile.upsert({
      where: { id: user.id },
      update: {
        email: user.email!, // Email might change?
        avatarUrl: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatarUrl: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider,
        userType: 'general',
        hasCompletedOnboarding: false,
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('[API] Error fetching profile:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Update userType endpoint
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: any = {};

    if (body.userType) {
      if (!['general', 'parent'].includes(body.userType)) {
        return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
      }
      updateData.userType = body.userType;
    }

    if (typeof body.hasCompletedOnboarding === 'boolean') {
      updateData.hasCompletedOnboarding = body.hasCompletedOnboarding;
    }

    const profile = await prisma.userProfile.upsert({
      where: { id: session.user.id },
      update: updateData,
      create: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        avatarUrl: session.user.user_metadata?.avatar_url,
        provider: session.user.app_metadata?.provider,
        userType: updateData.userType || 'general',
        hasCompletedOnboarding: updateData.hasCompletedOnboarding || false,
      },
      include: {
        childProfiles: true
      }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
