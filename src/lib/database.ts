import mongoose from 'mongoose';

// Define interface for the mongoose connection cache
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare global variable to extend globalThis
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose
 * @returns Promise resolving to mongoose instance
 */
export async function connect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      connectTimeoutMS: 10000, // 10 seconds timeout for connection
    };

    // Get MongoDB URI from environment
    const MONGODB_URI = process.env.MONGODB_URI;

    // Check if MongoDB URI exists
    if (!MONGODB_URI) {
      console.warn(
        'MONGODB_URI not found in environment variables. Using development mode without database.'
      );
      
      // For development, we'll return below after logging instead of attempting connection
      if (process.env.NODE_ENV === 'development') {
        // Set a resolved promise to prevent further connection attempts
        cached.promise = Promise.resolve(mongoose);
        
        // Log instead of throwing
        console.log('Running in development mode without MongoDB. Data operations will be simulated.');
        
        // Return mongoose (note: operations will fail, but the app won't crash)
        return mongoose;
      }
      
      // In production, throw an error
      throw new Error(
        'Please define the MONGODB_URI environment variable for production'
      );
    }

    console.log('Connecting to MongoDB...');

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB successfully');
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error connecting to MongoDB:', e);
    
    // For development, don't crash the app
    if (process.env.NODE_ENV === 'development') {
      console.log('Failed to connect to MongoDB. Running in development mode without database.');
      return mongoose; // Return mongoose (operations will fail, but the app won't crash)
    }
    
    throw e;
  }

  return cached.conn;
} 