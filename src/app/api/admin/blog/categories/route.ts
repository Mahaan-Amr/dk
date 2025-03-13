import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getBlogCategoryModel from '@/models/BlogCategory';
import { isValidObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';

/**
 * GET /api/admin/blog/categories
 * Fetch all blog categories with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const BlogCategory = getBlogCategoryModel();
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    const parent = searchParams.get('parent');
    
    // Build query
    const query: Record<string, unknown> = {};
    
    // Add filters
    if (active !== null) {
      query.isActive = active === 'true';
    }
    
    if (parent) {
      if (parent === 'none') {
        query.parent = { $exists: false };
      } else if (isValidObjectId(parent)) {
        query.parent = parent;
      }
    }
    
    // Execute query
    const categories = await BlogCategory.find(query)
      .sort({ order: 1, 'name.fa': 1 })
      .populate('parent', 'name slug');
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blog/categories
 * Create a new blog category
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const BlogCategory = getBlogCategoryModel();
    
    // Verify authentication token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Extract and verify token
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    
    try {
      // Verify the token
      jwt.verify(token, jwtSecret);
      
      // Parse request body
      const data = await request.json();
      
      // Validate required fields
      if (!data.slug || !data.name?.fa || !data.name?.de) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Check for duplicate slug
      const existingCategory = await BlogCategory.findOne({ slug: data.slug });
      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
      
      // Validate parent category if provided
      if (data.parent) {
        if (!isValidObjectId(data.parent)) {
          return NextResponse.json(
            { error: 'Invalid parent category ID' },
            { status: 400 }
          );
        }
        
        const parentExists = await BlogCategory.findById(data.parent);
        if (!parentExists) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 400 }
          );
        }
      }
      
      // Create the blog category
      const newCategory = await BlogCategory.create(data);
      
      return NextResponse.json(newCategory, { status: 201 });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    );
  }
}

// Export dynamic config to ensure this is not cached
export const dynamic = 'force-dynamic'; 