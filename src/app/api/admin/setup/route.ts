import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Debug log for module loading
console.log('Setup API route module loaded');

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

// Create or get the Admin model
let Admin: mongoose.Model<IAdmin>;
try {
  // Try to get the existing model
  Admin = mongoose.model<IAdmin>('Admin');
} catch {
  // If the model doesn't exist, create it
  Admin = mongoose.model<IAdmin>('Admin', adminSchema);
}

// This is a special route that creates an admin user for initial setup
// It's protected by a setup key to prevent unauthorized access
export async function GET(request: NextRequest) {
  console.log('Setup API route GET handler called');
  try {
    // Get the setup key from query params
    const setupKey = request.nextUrl.searchParams.get('key');
    console.log('Setup key:', setupKey);
    
    // Check if the setup key matches
    // In a production environment, use a more secure approach
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY || 'admin_setup_key';
    
    if (setupKey !== expectedSetupKey) {
      console.log('Invalid setup key');
      return NextResponse.json(
        { message: 'Unauthorized: Invalid setup key' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return NextResponse.json(
        { message: 'Admin user already exists', adminExists: true },
        { status: 200 }
      );
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
    
    // Return success
    return NextResponse.json({
      message: 'Admin user created successfully',
      credentials: {
        username,
        password, // Only return this in setup mode for first-time use
      },
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export configuration
export const dynamic = 'force-dynamic'; 