import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/middleware';
import { z } from 'zod';

// Define validation schema for the request
const exampleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters")
});

// Handler function for the POST request
async function handler(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    // Validate input using Zod
    const result = exampleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          message: 'Invalid input', 
          errors: result.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    // Extract validated data
    const { title, content } = result.data;
    
    // Process the request (this is where you would do actual data operations)
    console.log(`Processing request with title: ${title}`);
    
    // Return success response
    return NextResponse.json({
      message: 'Example API call successful',
      data: { title, content, timestamp: new Date().toISOString() }
    });
    
  } catch (error) {
    console.error('Example API error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// Export POST method with CSRF protection middleware
export const POST = (request: NextRequest) => csrfProtection(request, handler); 