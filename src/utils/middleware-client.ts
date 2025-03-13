import jwt from 'jsonwebtoken';

/**
 * This client has been moved from middleware to server components due to
 * Edge Runtime limitations with the crypto module.
 * 
 * It's still used for token verification in server components like the dashboard.
 */
interface MiddlewareClient {
  verifyToken: (token: string) => Promise<boolean>;
}

export function createMiddlewareClient(): MiddlewareClient {
  return {
    verifyToken: async (token: string) => {
      try {
        // Get the JWT secret from environment variables
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret);
        
        // If the token is valid, return true
        return !!decoded;
      } catch (error) {
        console.error('Token verification failed:', error);
        
        // If the token is invalid, return false
        return false;
      }
    },
  };
} 