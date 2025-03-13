import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getBlogPostModel from '@/models/BlogPost';
import getBlogCategoryModel from '@/models/BlogCategory';
import jwt from 'jsonwebtoken';

/**
 * GET /api/admin/blog/posts/[slug]
 * Fetch a single blog post by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    const BlogPost = getBlogPostModel();
    
    const post = await BlogPost.findOne({ 
      slug: params.slug,
      isDeleted: false
    })
      .populate('categories', 'name slug')
      .populate('author', 'name username');
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ post });
  } catch (error) {
    console.error(`Error fetching blog post ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/blog/posts/[slug]
 * Update a blog post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
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
      // Verify the token - we don't need the decoded value for this endpoint
      jwt.verify(token, jwtSecret);
      
      // Find the post
      const post = await BlogPost.findOne({ slug: params.slug, isDeleted: false });
      
      if (!post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      
      // Parse request body
      const data = await request.json();
      
      // Validate required fields
      if (!data.content?.fa?.title || !data.content?.de?.title) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Check for duplicate slug if slug is being changed
      if (data.slug && data.slug !== params.slug) {
        const existingPost = await BlogPost.findOne({ slug: data.slug });
        if (existingPost) {
          return NextResponse.json(
            { error: 'A post with this slug already exists' },
            { status: 400 }
          );
        }
      }
      
      // Validate categories if provided
      if (data.categories && data.categories.length > 0) {
        const BlogCategory = getBlogCategoryModel();
        const categoryCount = await BlogCategory.countDocuments({
          _id: { $in: data.categories },
          isActive: true,
        });
        
        if (categoryCount !== data.categories.length) {
          return NextResponse.json(
            { error: 'One or more categories are invalid' },
            { status: 400 }
          );
        }
      }
      
      // Update the post
      // If status is changing to published and no publish date, set it
      if (data.status === 'published' && post.status !== 'published' && !post.publishDate) {
        data.publishDate = new Date();
      }
      
      const updatedPost = await BlogPost.findOneAndUpdate(
        { slug: params.slug },
        { $set: data },
        { new: true }
      )
        .populate('categories', 'name slug')
        .populate('author', 'name username');
      
      return NextResponse.json(updatedPost);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(`Error updating blog post ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog/posts/[slug]
 * Soft delete a blog post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
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
      
      // Find the post
      const post = await BlogPost.findOne({ slug: params.slug, isDeleted: false });
      
      if (!post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      
      // Soft delete the post
      await BlogPost.findOneAndUpdate(
        { slug: params.slug },
        { $set: { isDeleted: true } }
      );
      
      return NextResponse.json(
        { message: 'Blog post deleted successfully' }
      );
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(`Error deleting blog post ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

// Export dynamic config to ensure this is not cached
export const dynamic = 'force-dynamic'; 