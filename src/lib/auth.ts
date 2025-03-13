import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types/jwt-types';

/**
 * Verifies the authentication status from a request
 * @param request The Next.js request object
 * @returns Object indicating success status and user ID if authenticated
 */
export async function verifyAuth(request: NextRequest): Promise<{ 
  success: boolean; 
  userId?: string; 
  message?: string;
}> {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get('admin_token')?.value || 
      request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { 
        success: false, 
        message: 'No authentication token found' 
      };
    }
    
    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return { 
        success: false, 
        message: 'Server configuration error' 
      };
    }
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    return { 
      success: true, 
      userId: decoded.id // Using id instead of userId based on JwtPayload interface
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 