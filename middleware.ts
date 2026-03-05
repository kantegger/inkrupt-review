import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'];
const DEFAULT_LOCALE = 'en';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore public files and API routes
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith('/api')) {
    return;
  }

  // Check if the pathname already includes a supported locale
  const pathnameIsMissingLocale = SUPPORTED_LOCALES.every(
    (locale) => !pathname.startsWith(`/${locale}`)
  );

  if (pathnameIsMissingLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Ignore Next internals, API, images/public, and ANY path containing a dot (static files like .ico/.png/.webmanifest/etc)
  matcher: ['/((?!_next|api|images|public|.*\\..*).*)'],
};
