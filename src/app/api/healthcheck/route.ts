import { NextResponse } from 'next/server';

// Debug log for module loading
console.log('Health check API route module loaded');

export async function GET() {
  console.log('Health check API route GET handler called');
  return NextResponse.json({ 
    status: 'ok',
    message: 'API system is working!',
    timestamp: new Date().toISOString(),
  });
}

export const dynamic = 'force-dynamic'; 