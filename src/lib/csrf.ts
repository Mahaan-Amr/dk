import Tokens from 'csrf';

// Create a new tokens instance
const tokens = new Tokens();

// Secret for token generation (using environment variables for better security)
const getSecret = () => {
  return process.env.CSRF_SECRET || process.env.JWT_SECRET || 'fallback_csrf_secret_000000000000000';
};

// Get a static secret for token verification
// Note: In a production app, you would want to rotate this secret
const SECRET = getSecret();

/**
 * Generate a CSRF token
 */
export function generateCsrfToken() {
  // Create a token using the secret
  return tokens.create(SECRET);
}

/**
 * Get CSRF token for forms
 * This should be called from a Server Component or Route Handler
 */
export function getCsrfToken() {
  const token = generateCsrfToken();
  
  // Return the token to be included in forms
  return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token) return false;
  
  try {
    // Verify the token with our secret
    return tokens.verify(SECRET, token);
  } catch (error) {
    console.error('CSRF verification error:', error);
    return false;
  }
}

/**
 * Middleware to validate CSRF token for API routes
 */
export function validateCsrfRequest(request: Request): { isValid: boolean; error?: string } {
  // Get the CSRF token from the header, form data, or query parameters
  const csrfToken = 
    request.headers.get('x-csrf-token') || 
    '';
  
  if (!csrfToken) {
    return { isValid: false, error: 'CSRF token is missing' };
  }
  
  // Verify the token
  const isValid = verifyCsrfToken(csrfToken);
  
  if (!isValid) {
    return { isValid: false, error: 'CSRF token is invalid' };
  }
  
  return { isValid: true };
} 