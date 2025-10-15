import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir acceso a /admin (página de login) para todos
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Proteger subrutas de /admin (si se agregan en el futuro)
  if (pathname.startsWith('/admin/')) {
    // Comprobación básica: requerir cookie de sesión
    const token = req.cookies.get('token');
    if (!token) {
      // Responder 404 para no revelar rutas de admin
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

