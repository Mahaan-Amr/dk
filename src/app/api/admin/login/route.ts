import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Debug log for module loading
console.log('[API] Admin Login API route module loaded');

// Define the admin interface
interface IAdmin {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  name?: string;
  email?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Define the admin schema
const adminSchema = new mongoose.Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

// Create admin model function (safely tries to use existing model or create new one)
function getAdminModel() {
  try {
    // Try to get the existing model
    return mongoose.model<IAdmin>('Admin');
  } catch {
    // If the model doesn't exist, create it
    return mongoose.model<IAdmin>('Admin', adminSchema);
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] Admin Login API route POST handler called');
  try {
    // Parse the request body
    const { username, password } = await request.json();
    console.log(`[API] Login attempt for username: ${username}`);
    
    // Validate input
    if (!username || !password) {
      console.log('[API] Login failed: Missing username or password');
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    try {
      // Connect to the database
      console.log('[API] Connecting to database...');
      await connectToDatabase();
      console.log('[API] Connected to database');
      
      // Get or create the Admin model
      const Admin = getAdminModel();
      
      // Find the admin user
      let admin;
      try {
        admin = await Admin.findOne({ username });
        console.log(`[API] User search result: ${admin ? 'Found' : 'Not found'}`);
      } catch (findError) {
        console.error('[API] Error finding admin:', findError);
        
        // In development mode, proceed with a fake admin
        if (process.env.NODE_ENV === 'development') {
          console.log('[API] Development mode: Using fake admin');
          admin = null;
        } else {
          throw findError;
        }
      }
      
      // If admin doesn't exist and NOT in development mode, return error
      if (!admin && process.env.NODE_ENV !== 'development') {
        console.log('[API] Login failed: Invalid credentials (user not found)');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      let isPasswordValid = false;
      
      // Check password if admin exists
      if (admin) {
        try {
          isPasswordValid = await bcrypt.compare(password, admin.password);
          console.log(`[API] Password validation result: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
        } catch (compareError) {
          console.error('[API] Error comparing passwords:', compareError);
          
          // In development mode, proceed with fake validation
          if (process.env.NODE_ENV === 'development') {
            isPasswordValid = (password === 'DerakhtKherad@2024' && username === 'admin');
            console.log(`[API] Dev mode password check: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
          } else {
            throw compareError;
          }
        }
      } else if (process.env.NODE_ENV === 'development') {
        // In development mode, accept hardcoded credentials
        isPasswordValid = (password === 'DerakhtKherad@2024' && username === 'admin');
        console.log(`[API] Dev mode password check: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
      }
      
      if (!isPasswordValid) {
        console.log('[API] Login failed: Invalid password');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Update last login time if admin exists
      if (admin) {
        try {
          admin.lastLogin = new Date();
          await admin.save();
          console.log('[API] Updated last login time');
        } catch (saveError) {
          console.warn('[API] Failed to update last login time:', saveError);
          // Non-critical error, continue
        }
      }
      
      // Create payload
      const payload = {
        id: admin ? admin._id.toString() : 'dev_id',
        username: username
      };
      console.log('[API] Creating token with payload:', payload);
      
      // Use a simple approach with jwt.sign that TypeScript accepts
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
      console.log(`[API] Using JWT secret (first 3 chars): ${jwtSecret.substring(0, 3)}...`);
      
      let token: string;
      
      try {
        // @ts-expect-error - Type issues with jwt.sign parameter types
        token = jwt.sign(payload, jwtSecret, {
          expiresIn: process.env.JWT_EXPIRY || '7d'
        });
        console.log(`[API] Token created (first 10 chars): ${token.substring(0, 10)}...`);
      } catch (signError) {
        console.error('[API] JWT sign error:', signError);
        
        // In development mode, use a fake token
        if (process.env.NODE_ENV === 'development') {
          token = 'dev_token_123456789';
          console.log('[API] Using fallback dev token');
        } else {
          return NextResponse.json(
            { message: 'Error generating authentication token' },
            { status: 500 }
          );
        }
      }
      
      // Create response with token
      const responseData = {
        message: 'Login successful',
        token,
        user: {
          id: admin ? admin._id : 'dev_id',
          username: username,
          name: admin ? admin.name : 'Admin User (Dev)',
          email: admin ? admin.email : 'admin@derakhtekherad.com',
        },
      };
      console.log('[API] Login successful, returning token and user data');
      
      // Return success with token
      return NextResponse.json(responseData);
      
    } catch (dbError) {
      console.error('[API] Database error:', dbError);
      
      // In development mode, provide a fake response
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Development mode: Providing fake login response');
        return NextResponse.json({
          message: 'Login successful (dev mode)',
          token: 'dev_token_123456789',
          user: {
            id: 'dev_id',
            username: username,
            name: 'Admin User (Dev)',
            email: 'admin@derakhtekherad.com',
          },
          devMode: true,
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

// Export configuration
export const dynamic = 'force-dynamic'; 