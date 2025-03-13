import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n';

// Create middleware for internationalization
export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Use Farsi as the default locale
  defaultLocale: 'fa',
  
  // This is used when a user first visits the website
  // or if they visit a non-localized path (e.g., /about)
  localePrefix: 'as-needed',
  
  // Detect locale from Accept-Language header
  localeDetection: true,
});
 
export const config = {
  // Match all pathnames except for:
  // - API routes (/api/...)
  // - _next (Next.js internals)
  // - Static files (images, etc.)
  matcher: [
    // Use a lookahead to exclude paths that start with /api, /_next, or contain a dot (for files)
    '/((?!api|_next|static|.*\\.).)*'
  ],
}; 