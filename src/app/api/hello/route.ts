import { NextResponse } from 'next/server';

// Debug log for module loading
console.log('Hello API route module loaded');

export async function GET() {
  console.log('Hello API route GET handler called');
  return NextResponse.json({ message: 'Hello from the API!' });
}

export const dynamic = 'force-dynamic'; 