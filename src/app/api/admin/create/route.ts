import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

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

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const { username, password, name, email, secretKey } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Check secret key for security
    // This is a simple security measure to prevent unauthorized admin creation
    // In a production environment, you would use a more secure approach
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || 'admin_secret_key';
    if (secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin with this username already exists' },
        { status: 409 }
      );
    }
    
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
    
    // Return success
    return NextResponse.json({
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 