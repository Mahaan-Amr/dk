import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';

// Debug log for module loading
console.log('Test DB API route module loaded');

export async function GET() {
  console.log('Test DB API route GET handler called');
  try {
    // Attempt to connect to MongoDB
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database');
    
    // Get connection state
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    const state = stateMap[connectionState as keyof typeof stateMap] || 'unknown';
    console.log('Database connection state:', state);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection test',
      connection: {
        state,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        models: Object.keys(mongoose.models),
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection test failed',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// Export configuration
export const dynamic = 'force-dynamic'; 