import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getBlogCategoryModel from '@/models/BlogCategory';
import getBlogPostModel from '@/models/BlogPost';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Define interface for the category
interface BlogCategory {
  _id: Types.ObjectId;
  slug: string;
  name: {
    fa: string;
    de: string;
  };
  description?: {
    fa?: string;
    de?: string;
  };
  parent?: Types.ObjectId | null;
  order: number;
  isActive: boolean;
}

/**
 * GET /api/admin/blog/categories/[slug]
 * Fetch a single blog category by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    const BlogCategory = getBlogCategoryModel();
    
    const category = await BlogCategory.findOne({ slug: params.slug })
      .populate('parent', 'name slug');
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error(`Error fetching category ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/blog/categories/[slug]
 * Update a blog category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
      
      // Find the category
      const category = await BlogCategory.findOne({ slug: params.slug }) as BlogCategory | null;
      
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      // Parse request body
      const data = await request.json();
      
      // Validate required fields
      if (!data.name?.fa || !data.name?.de) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Check for duplicate slug if slug is being changed
      if (data.slug && data.slug !== params.slug) {
        const existingCategory = await BlogCategory.findOne({ slug: data.slug });
        if (existingCategory) {
          return NextResponse.json(
            { error: 'A category with this slug already exists' },
            { status: 400 }
          );
        }
      }
      
      // Prevent circular parent references
      if (data.parent && data.parent === (category as BlogCategory)._id.toString()) {
        return NextResponse.json(
          { error: 'A category cannot be its own parent' },
          { status: 400 }
        );
      }
      
      // Update the category
      const updatedCategory = await BlogCategory.findOneAndUpdate(
        { slug: params.slug },
        { $set: data },
        { new: true }
      ).populate('parent', 'name slug');
      
      return NextResponse.json(updatedCategory);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(`Error updating category ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog/categories/[slug]
 * Delete a blog category (only if it has no posts)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    const BlogCategory = getBlogCategoryModel();
    const BlogPost = getBlogPostModel();
    
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
      
      // Find the category
      const category = await BlogCategory.findOne({ slug: params.slug }) as BlogCategory | null;
      
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      // Check if category has child categories
      const childCategories = await BlogCategory.countDocuments({ parent: category._id });
      if (childCategories > 0) {
        return NextResponse.json(
          { error: 'Cannot delete category with child categories' },
          { status: 400 }
        );
      }
      
      // Check if category has posts
      const postsWithCategory = await BlogPost.countDocuments({ 
        categories: category._id,
        isDeleted: false
      });
      
      if (postsWithCategory > 0) {
        return NextResponse.json(
          { error: 'Cannot delete category with associated posts' },
          { status: 400 }
        );
      }
      
      // Delete the category
      await BlogCategory.findByIdAndDelete(category._id);
      
      return NextResponse.json(
        { message: 'Category deleted successfully' }
      );
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(`Error deleting category ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// Export dynamic config to ensure this is not cached
export const dynamic = 'force-dynamic'; 