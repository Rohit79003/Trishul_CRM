import { NextRequest, NextResponse } from 'next/server';

const roleRoutes: Record<string, string[]> = {
  '/employees': ['admin', 'supervisor'],
  '/ai-assistant': ['admin'],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const path = req.nextUrl.pathname;

  const isDashboardRoute = [
    '/dashboard',
    '/customers',
    '/leads',
    '/tasks',
    '/employees',
    '/reports',
    '/ai-assistant',
    '/settings',
  ].some((r) => path.startsWith(r));

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers/:path*',
    '/leads/:path*',
    '/tasks/:path*',
    '/employees/:path*',
    '/reports/:path*',
    '/ai-assistant/:path*',
    '/settings/:path*',
  ],
};
