import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfRequest } from './csrf';

/**
 * Middleware to protect state-changing API routes with CSRF validation
 * This should be used for POST, PUT, DELETE, and PATCH requests
 */
export async function csrfProtection(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  // Only validate POST, PUT, DELETE, PATCH methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!stateChangingMethods.includes(request.method)) {
    // Skip CSRF validation for safe methods
    return handler(request);
  }

  // Skip CSRF validation for login route
  // This is because the login page won't have a CSRF token yet
  if (request.url.includes('/api/admin/login')) {
    return handler(request);
  }

  // Validate CSRF token
  const { isValid, error } = validateCsrfRequest(request);

  if (!isValid) {
    console.error(`[API] CSRF validation failed: ${error}`);
    return NextResponse.json(
      { 
        message: 'CSRF validation failed',
        error 
      },
      { status: 403 }
    );
  }

  // Proceed with the request if CSRF is valid
  return handler(request);
} 