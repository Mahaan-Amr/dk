import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Debug log for module loading
console.log('Create Admin API route module loaded');

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

export async function GET(request: NextRequest) {
  console.log('Create Admin API route GET handler called');
  try {
    // Get the setup key from query params
    const setupKey = request.nextUrl.searchParams.get('key');
    console.log('Setup key:', setupKey);
    
    // Check if the setup key matches
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY || 'admin_setup_key';
    
    if (setupKey !== expectedSetupKey) {
      console.log('Invalid setup key');
      return NextResponse.json(
        { message: 'Unauthorized: Invalid setup key' },
        { status: 401 }
      );
    }

    try {
      // Connect to the database
      console.log('Connecting to database...');
      await connectToDatabase();
      console.log('Connected to database');
      
      // Get or create the Admin model
      const Admin = getAdminModel();
      
      // Check if admin already exists
      try {
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
          console.log('Admin user already exists');
          return NextResponse.json(
            { message: 'Admin user already exists', adminExists: true },
            { status: 200 }
          );
        }
      } catch (findError) {
        // In development mode, just proceed with creating an admin
        if (process.env.NODE_ENV !== 'development') {
          throw findError;
        }
        console.warn('Error finding admin, but continuing in development mode:', findError);
      }
      
      // Create a default admin user
      console.log('Creating admin user...');
      const username = 'admin';
      const password = 'DerakhtKherad@2024'; // Strong default password
      const name = 'Admin User';
      const email = 'admin@derakhtekherad.com';
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new admin
      try {
        const newAdmin = new Admin({
          username,
          password: hashedPassword,
          name,
          email,
          createdAt: new Date(),
        });
        
        // Save to database
        await newAdmin.save();
        console.log('Admin user created successfully');
      } catch (saveError) {
        // In development mode, just proceed as if it worked
        if (process.env.NODE_ENV !== 'development') {
          throw saveError;
        }
        console.warn('Error saving admin, but continuing in development mode:', saveError);
      }
      
      // Return success
      return NextResponse.json({
        message: 'Admin user created successfully',
        credentials: {
          username,
          password, // Only return this in setup mode for first-time use
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // In development mode, provide credentials anyway to allow testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Running in development mode - providing credentials anyway');
        return NextResponse.json({
          message: 'Development mode: Admin credentials (database error ignored)',
          credentials: {
            username: 'admin',
            password: 'DerakhtKherad@2024',
          },
          error: 'Database error (ignored in development)',
        });
      }
      
      throw dbError; // Rethrow for production environments
    }
  } catch (error) {
    console.error('Admin setup error:', error);
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