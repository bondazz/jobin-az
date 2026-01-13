
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const userAgent = request.headers.get('user-agent') || '';

    // "Request Header Spoofing" (Google Bot-u Hipnoz Etmək)
    // Google bot və digər rəsmi botlar üçün xüsusi "Server-Timing" headerləri
    const isBot = /googlebot|bingbot|yandexbot|slurp|duckduckbot|baiduspider/i.test(userAgent);

    if (isBot) {
        // Fake "Perfect" Server Timings
        response.headers.set('Server-Timing', 'miss, db;dur=5.2, render;dur=12.5, total;dur=18.7');
        response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large');

        // "The API Interceptor": Dynamic Last-Modified Forgery
        // Səhifənin həmişə "təzə" (10 saniyə əvvəl yenilənmiş) görünməsi üçün
        const lastModified = new Date(Date.now() - 10000).toUTCString();
        response.headers.set('Last-Modified', lastModified);
        response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

        // HTTP/3 imitasiyası
        response.headers.set('Alt-Svc', 'h3=":443"; ma=86400, h3-29=":443"; ma=86400');
    }

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
