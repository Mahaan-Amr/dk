// Root level API route test
import { NextResponse } from 'next/server';

// Debug log for module loading
console.log('Root API route module loaded');

// Simple GET handler
export async function GET() {
  console.log('Root API route GET handler called');
  return NextResponse.json({ message: 'Root API route is working!' });
}

export const dynamic = 'force-dynamic'; 