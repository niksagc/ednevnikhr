import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // 1. Ako nije prijavljen, preusmjeri na login (osim ako je već na login stranici)
  if (!session && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. Ako je prijavljen, provjeri ulogu
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = profile?.role;
    const path = req.nextUrl.pathname;

    // Logika zaštite: Ako pokušava ući u admin, a nije admin -> preusmjeri ga na njegov dashboard
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, req.url));
    }
    
    // Dodajte ovdje slične provjere za /teacher, /student, /parent...
    if (path.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(`/${role || 'student'}`, req.url));
    }
  }

  return res;
}

// Koje stranice middleware "prati"
export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*', '/parent/:path*'],
};
