import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
 const protectedPath = ['/checkout', '/profile', '/admin'].some((path) => request.nextUrl.pathname.startsWith(path));
 const hasSession = Boolean(request.cookies.get('sb-access-token')?.value || request.cookies.get('1mg-demo-session')?.value);
 if (protectedPath && !hasSession) {
  const login = new URL('/login', request.url);
  login.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(login);
 }
 return NextResponse.next();
}

export const config = { matcher: ['/checkout/:path*', '/profile/:path*', '/admin/:path*'] };
