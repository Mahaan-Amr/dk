import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  console.log('[API] Auth check endpoint called');
  
  try {
    // Verify the authentication
    const authResult = await verifyAuth(request);
    
    if (!authResult.success) {
      console.log('[API] Auth check failed:', authResult.message);
      return NextResponse.json(
        { message: authResult.message || 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // Return success with user ID
    console.log('[API] Auth check successful for user:', authResult.userId);
    return NextResponse.json({
      authenticated: true,
      userId: authResult.userId
    });
  } catch (error) {
    console.error('[API] Auth check error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

// Export configuration to ensure this route is always dynamic
export const dynamic = 'force-dynamic'; 