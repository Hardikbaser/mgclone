import { NextResponse, type NextRequest } from 'next/server';

function hasUsableJwt(jwt: string | undefined) {
 if (!jwt) return false;
 try {
  const [, encodedPayload, signature] = jwt.split('.');
  if (!encodedPayload || !signature) return false;
  const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
  const payload = JSON.parse(atob(base64Payload)) as { exp?: number };
  return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
 } catch {
  return false;
 }
}

export function middleware(request: NextRequest) {
 const protectedPath = ['/dashboard', '/cart', '/orders', '/checkout', '/profile', '/admin'].some((path) => request.nextUrl.pathname.startsWith(path));
 const jwt = request.cookies.get('token')?.value ?? request.cookies.get('jwt')?.value;
 // This is an optimistic route check; Express validates the JWT signature on API calls.
 const hasValidJwt = hasUsableJwt(jwt);
 if (protectedPath && !hasValidJwt) {
  const login = new URL('/login', request.url);
  login.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(login);
 }
 return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/cart/:path*', '/orders/:path*', '/checkout/:path*', '/profile/:path*', '/admin/:path*'] };
