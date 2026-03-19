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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Ako nije prijavljen, a pokušava pristupiti zaštićenoj ruti
  if (!user && (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/teacher') ||
    request.nextUrl.pathname.startsWith('/student') ||
    request.nextUrl.pathname.startsWith('/parent')
  )) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Ako je prijavljen, provjeri ulogu
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    const path = request.nextUrl.pathname;

    // Ako je na login stranici, a već je prijavljen, preusmjeri ga na dashboard
    if (path === '/') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }

    // Logika zaštite ruta
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
    
    if (path.startsWith('/teacher') && role !== 'nastavnik') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
    
    if (path.startsWith('/student') && role !== 'ucenik') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
    
    if (path.startsWith('/parent') && role !== 'parent') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
  }

  return response
}

export const config = {
  matcher: ['/', '/admin/:path*', '/teacher/:path*', '/student/:path*', '/parent/:path*'],
};
