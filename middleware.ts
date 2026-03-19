import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname;

  // 1. Ako nije prijavljen, preusmjeri na login (osim ako je već na login stranici)
  if (!user && path !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Ako je prijavljen, provjeri ulogu
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'student';

    // Ako je korisnik na login stranici, preusmjeri ga na njegov dashboard
    if (path === '/') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Provjera pristupa: ako pokušava ući u rutu koja nije njegova, preusmjeri ga na njegovu
    if (!path.startsWith(`/${role}`)) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return response
}

export const config = {
  // Prati sve rute osim statičkih datoteka i login stranice
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
