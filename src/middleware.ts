import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJWT(token: string): { userId: string; email: string; role: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64Url decode to Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  const { pathname } = request.nextUrl;

  const payload = token ? decodeJWT(token) : null;
  const now = Date.now() / 1000;
  const isExpired = payload?.exp ? payload.exp < now : true;

  // If token is invalid or expired
  const isLoggedIn = payload && !isExpired;

  // Define route protections
  if (pathname.startsWith('/patient')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (payload.role !== 'PATIENT') {
      return NextResponse.redirect(new URL(getDashboardRoute(payload.role), request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    // Avoid redirect loop on admin login page
    if (pathname === '/admin/login') {
      if (isLoggedIn && payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getDashboardRoute(payload.role), request.url));
    }
  }

  if (pathname.startsWith('/doctor')) {
    // Avoid redirect loop on doctor login page
    if (pathname === '/doctor/login') {
      if (isLoggedIn && payload.role === 'DOCTOR') {
        return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/doctor/login', request.url));
    }
    if (payload.role !== 'DOCTOR') {
      return NextResponse.redirect(new URL(getDashboardRoute(payload.role), request.url));
    }
  }

  // Redirect logged in users away from public login/register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getDashboardRoute(payload.role), request.url));
    }
  }

  return NextResponse.next();
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'PATIENT':
      return '/patient/dashboard';
    default:
      return '/login';
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/patient/:path*',
    '/admin/:path*',
    '/doctor/:path*',
    '/login',
    '/register',
    '/'
  ],
};
