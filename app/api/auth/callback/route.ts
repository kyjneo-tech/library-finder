import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // 🔍 디버깅용 로그: 들어오는 전체 URL 확인
  console.log('[Auth Callback] Request URL:', request.url);

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';
  
  // Hash fragment detection hint (only visible in server logs, client can't send hash to server)
  // If we receive no params, it's possible parameters are in the hash (Implicit Flow), which server can't see.

  if (code) {
    const cookieStore = await cookies();
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
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // console.error('Auth error:', error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
  }

  // Check for provider errors (e.g. error=access_denied&error_code=...&error_description=...)
  const errorCode = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (errorCode || errorDescription) {
     const cleanError = errorCode || 'unknown_error';
     const cleanDesc = errorDescription || 'No description provided';
     return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(cleanError)}&description=${encodeURIComponent(cleanDesc)}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}
