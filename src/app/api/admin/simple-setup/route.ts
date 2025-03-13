import { NextResponse } from 'next/server';

// Debug log for module loading
console.log('Simple Setup API route module loaded');

export async function GET() {
  console.log('Simple Setup API route GET handler called');
  
  return NextResponse.json({
    message: 'Simple admin setup API is working!',
    credentials: {
      username: 'admin',
      password: 'DerakhtKherad@2024',
    },
  });
}

// Export required metadata
export const dynamic = 'force-dynamic'; 