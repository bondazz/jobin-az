import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18nConfig, isValidLocale, getLocaleFromPathname } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files, api routes, and admin
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') ||
    pathname.startsWith('/lovable-uploads') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  // Get locale from pathname
  const locale = getLocaleFromPathname(pathname);
  
  // If default locale (az), no redirect needed - pages work without prefix
  // If other locale (en, ru), the [lang] route will handle it
  
  // Add locale header for server components
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
