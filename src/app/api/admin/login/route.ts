import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { z } from 'zod';
import { generateCsrfToken } from '@/lib/csrf';

// Debug log for module loading
console.log('[API] Admin Login API route module loaded');

// Define the login schema with Zod
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

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
    // Parse and validate the request body
    const body = await request.json();
    
    // Validate input using Zod
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      console.log('[API] Login failed: Invalid input', result.error.format());
      return NextResponse.json(
        { 
          message: 'Invalid input', 
          errors: result.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    // Extract validated data
    const { username, password } = result.data;
    console.log(`[API] Login attempt for username: ${username}`);
    
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
        throw findError;
      }
      
      // If admin doesn't exist, return error
      if (!admin) {
        console.log('[API] Login failed: Invalid credentials (user not found)');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      let isPasswordValid = false;
      
      // Check password
      try {
        isPasswordValid = await bcrypt.compare(password, admin.password);
        console.log(`[API] Password validation result: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
      } catch (compareError) {
        console.error('[API] Error comparing passwords:', compareError);
        throw compareError;
      }
      
      if (!isPasswordValid) {
        console.log('[API] Login failed: Invalid password');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Update last login time
      try {
        admin.lastLogin = new Date();
        await admin.save();
        console.log('[API] Updated last login time');
      } catch (saveError) {
        console.warn('[API] Failed to update last login time:', saveError);
        // Non-critical error, continue
      }
      
      // Create payload
      const payload = {
        id: admin._id.toString(),
        username: username
      };
      console.log('[API] Creating token with payload:', payload);
      
      // Properly check for JWT_SECRET environment variable
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not defined');
        return NextResponse.json(
          { message: 'Server configuration error' },
          { status: 500 }
        );
      }
      
      let token: string;
      
      try {
        // @ts-expect-error - Type issues with jwt.sign parameter types
        token = jwt.sign(payload, jwtSecret, {
          expiresIn: process.env.JWT_EXPIRY || '7d'
        });
        console.log(`[API] Token created (first 10 chars): ${token.substring(0, 10)}...`);
      } catch (signError) {
        console.error('[API] JWT sign error:', signError);
        return NextResponse.json(
          { message: 'Error generating authentication token' },
          { status: 500 }
        );
      }
      
      // Create response with token
      const responseData = {
        message: 'Login successful',
        token,
        user: {
          id: admin._id,
          username: username,
          name: admin.name,
          email: admin.email,
        },
        // Generate CSRF token for API requests
        csrfToken: generateCsrfToken(),
      };
      console.log('[API] Login successful, returning token and user data');
      
      // Return success with token
      return NextResponse.json(responseData);
      
    } catch (dbError) {
      console.error('[API] Database error:', dbError);
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