// Instrumentation file for Next.js
// This runs at server startup

export async function register() {
  console.log('Next.js instrumentation hook registered');
  
  // Log the environment
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Skip all file system operations in instrumentation
  // This avoids issues with webpack and Node.js modules
  
  // Note: If server-only file system operations are needed,
  // they should be moved to a server component or API route
} 