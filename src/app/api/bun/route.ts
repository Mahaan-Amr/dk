import { NextResponse } from 'next/server';

// Debug log for module loading
console.log('Bun API route module loaded');

export async function GET() {
  console.log('Bun API route GET handler called');
  return NextResponse.json({ message: 'Bun API is working!' });
}

export const dynamic = 'force-dynamic'; 