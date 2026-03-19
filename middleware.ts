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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Ako nije prijavljen, preusmjeri na login (osim ako je već na login stranici)
  if (!user && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Ako je prijavljen, provjeri ulogu
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    const path = request.nextUrl.pathname;

    if (path === '/dashboard') {
      return response;
    }

    // Logika zaštite: Ako pokušava ući u admin, a nije admin -> preusmjeri ga na njegov dashboard
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
    
    if (path.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
    
    if (path.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
    
    if (path.startsWith('/parent') && role !== 'parent') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
    }
  }

  return response
}

// Koje stranice middleware "prati"
export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*', '/parent/:path*'],
};
