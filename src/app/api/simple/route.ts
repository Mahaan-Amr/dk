import { NextResponse } from 'next/server';

// Debug log for module loading
console.log('Simple API route module loaded');

export async function GET() {
  console.log('Simple API route GET handler called');
  return NextResponse.json({ message: 'Simple API is working!' });
}

// Export required metadata
export const dynamic = 'force-dynamic'; 