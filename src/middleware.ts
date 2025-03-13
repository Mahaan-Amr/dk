import { NextRequest, NextResponse } from 'next/server';
import { locales, Locale } from './i18n';

export async function middleware(request: NextRequest) {
  // Get the pathname and URL of the request
  const pathname = request.nextUrl.pathname;
  const fullUrl = request.url;
  console.log(`[Middleware] Processing request: ${pathname} (${fullUrl})`);
  
  // Always log cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log(`[Middleware] Request cookies count: ${allCookies.length}`);
  const adminToken = request.cookies.get('admin_token');
  if (adminToken) {
    console.log(`[Middleware] Found admin_token cookie (first 10 chars): ${adminToken.value.substring(0, 10)}...`);
  } else {
    console.log(`[Middleware] No admin_token cookie found`);
  }
  
  // Skip middleware for API routes that don't need authentication
  if (pathname.startsWith('/api/admin/login') || pathname.startsWith('/api/admin/create')) {
    console.log(`[Middleware] Skipping auth check for exempt API route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Skip middleware for login page
  if (pathname.includes('/admin/login')) {
    console.log(`[Middleware] Skipping auth check for login page: ${pathname}`);
    return NextResponse.next();
  }
  
  // Handle API authentication (simplified)
  if (pathname.startsWith('/api/admin/')) {
    // API authentication logic...
    return NextResponse.next();
  }
  
  // Handle admin dashboard routes (anything under /admin/ except login)
  if (pathname.includes('/admin/') && !pathname.includes('/admin/login')) {
    const pathnameLocale = pathname.split('/')[1];
    console.log(`[Middleware] Checking admin page auth: ${pathname}, locale: ${pathnameLocale}`);
    
    // Check if the locale is valid
    if (locales.includes(pathnameLocale as Locale)) {
      // Get the token from the cookies
      const token = request.cookies.get('admin_token')?.value;
      
      if (!token) {
        console.log(`[Middleware] No token found for admin page: ${pathname}`);
        // Redirect to login page
        return NextResponse.redirect(
          new URL(`/${pathnameLocale}/admin/login`, request.url)
        );
      }
      
      // At this point we have a token
      console.log(`[Middleware] Found token for ${pathname}, allowing access`);
      
      // NOTE: We're no longer trying to verify the token in middleware
      // because the Edge Runtime doesn't support the crypto module
      // Token validation will happen in the server components instead
      
      return NextResponse.next();
    }
  }
  
  // Allow all other requests to proceed
  console.log(`[Middleware] No auth check needed for: ${pathname}`);
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all admin routes
    '/:locale/admin/:path*',
  ],
}; 