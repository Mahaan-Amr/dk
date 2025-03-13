import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connect } from '@/lib/database';
import getBlogPostModel from '@/models/BlogPost';
import getBlogCategoryModel from '@/models/BlogCategory';
import getAdminModel from '@/models/Admin';

/**
 * GET - Retrieve a blog post preview
 * This route allows retrieving a preview version of a blog post, 
 * including drafts and posts with a future publish date
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the post ID from the route parameters
    const { id } = params;

    // Verify authentication (important to prevent unauthorized access to draft posts)
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Connect to the database
    await connect();

    // Get models
    const BlogPost = getBlogPostModel();
    const BlogCategory = getBlogCategoryModel();
    const Admin = getAdminModel();

    // Determine if we're looking up by ID or by temporary preview ID
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    // Find the post with populated categories
    const query = isObjectId ? { _id: id } : { 'preview.id': id };

    const post = await BlogPost.findOne(query)
      .populate({
        path: 'categories',
        model: BlogCategory,
        select: '_id name slug',
      })
      .populate({
        path: 'author',
        model: Admin,
        select: 'name _id',
      });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Convert Mongoose document to plain object
    const postObj = post.toObject();

    // Return the post data
    return NextResponse.json({
      success: true,
      post: postObj,
    });
  } catch (error) {
    console.error('Error retrieving post preview:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a temporary preview for a post that hasn't been saved yet
 * This allows previewing content that isn't even saved as a draft
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();
    
    // Generate a temporary preview ID (we'll use a timestamp + random string)
    const previewId = `preview_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Connect to the database
    await connect();
    
    // Get models
    const BlogPost = getBlogPostModel();
    
    // Create a temporary post document with the preview flag
    // This won't be an actual post in the database, just a temporary preview
    const tempPost = new BlogPost({
      ...data,
      author: authResult.userId,
      preview: {
        id: previewId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour expiration
      },
    });
    
    // Save the temporary preview post
    await tempPost.save();
    
    // Return the preview ID that can be used to retrieve this post
    return NextResponse.json({
      success: true,
      previewId,
      previewUrl: `/api/admin/blog/preview/${previewId}`,
    });
  } catch (error) {
    console.error('Error creating post preview:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 