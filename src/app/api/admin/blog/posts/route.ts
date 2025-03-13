import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getBlogPostModel from '@/models/BlogPost';
import getBlogCategoryModel from '@/models/BlogCategory';
import jwt from 'jsonwebtoken';

/**
 * GET /api/admin/blog/posts
 * Fetch all blog posts with filtering, pagination, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const BlogPost = getBlogPostModel();
    
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status') || '';
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    
    // Build query
    interface MongoQueryOperators {
      $regex: string;
      $options: string;
    }
    
    interface MongoQueryIn {
      $in: string[];
    }
    
    interface BlogPostQuery {
      isDeleted: boolean;
      status?: string;
      categories?: MongoQueryIn;
      $or?: Array<{
        [key: string]: MongoQueryOperators | RegExp;
      }>;
    }
    
    const query: BlogPostQuery = { isDeleted: false };
    
    // Add filters
    if (status) {
      query.status = status;
    }

    if (category) {
      query.categories = { $in: [category] };
    }
    
    // Add search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { 'content.fa.title': searchRegex },
        { 'content.de.title': searchRegex },
        { 'content.fa.summary': searchRegex },
        { 'content.de.summary': searchRegex },
        { slug: searchRegex }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Prepare sort option
    const sortOption: Record<string, 1 | -1> = {};
    sortOption[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query
    const posts = await BlogPost.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name slug')
      .populate('author', 'name username');
    
    // Get total count for pagination
    const total = await BlogPost.countDocuments(query);
    
    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blog/posts
 * Create a new blog post
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const BlogPost = getBlogPostModel();
    
    // Verify authentication token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[API] POST /api/admin/blog/posts - Missing or invalid Authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }
    
    // Extract and verify token
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      console.log('[API] Token verification successful, user ID:', decoded.id);
      
      // Parse request body
      let data;
      try {
        data = await request.json();
      } catch (jsonError) {
        console.error('[API] POST /api/admin/blog/posts - Invalid JSON in request body', jsonError);
        return NextResponse.json(
          { error: 'Invalid request body - could not parse JSON' },
          { status: 400 }
        );
      }
      
      console.log('[API] Received post data:', { 
        slug: data.slug,
        title_fa: data.content?.fa?.title,
        title_de: data.content?.de?.title,
        categories: data.categories
      });
      
      // Validate required fields
      if (!data.slug || !data.slug.trim()) {
        console.error('[API] POST /api/admin/blog/posts - Missing slug field');
        return NextResponse.json(
          { error: 'Missing required field: slug' },
          { status: 400 }
        );
      }
      
      if (!data.content?.fa?.title || !data.content?.fa?.title.trim()) {
        console.error('[API] POST /api/admin/blog/posts - Missing Persian title');
        return NextResponse.json(
          { error: 'Missing required field: content.fa.title' },
          { status: 400 }
        );
      }
      
      if (!data.content?.de?.title || !data.content?.de?.title.trim()) {
        console.error('[API] POST /api/admin/blog/posts - Missing German title');
        return NextResponse.json(
          { error: 'Missing required field: content.de.title' },
          { status: 400 }
        );
      }
      
      // Check for duplicate slug
      const existingPost = await BlogPost.findOne({ slug: data.slug });
      if (existingPost) {
        console.error('[API] POST /api/admin/blog/posts - Duplicate slug:', data.slug);
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
      
      // Validate categories if provided
      if (data.categories && data.categories.length > 0) {
        try {
          const BlogCategory = getBlogCategoryModel();
          const categoryCount = await BlogCategory.countDocuments({
            _id: { $in: data.categories },
            isActive: true,
          });
          
          if (categoryCount !== data.categories.length) {
            console.error('[API] POST /api/admin/blog/posts - Invalid categories, found', categoryCount, 'of', data.categories.length);
            return NextResponse.json(
              { error: 'One or more categories are invalid' },
              { status: 400 }
            );
          }
        } catch (categoryError) {
          console.error('[API] Error validating categories:', categoryError);
          return NextResponse.json(
            { error: 'Error validating categories' },
            { status: 500 }
          );
        }
      }
      
      // Set the author to the current user
      data.author = decoded.id;
      
      // Create the blog post
      try {
        const newPost = await BlogPost.create(data);
        console.log('[API] Blog post created successfully:', newPost._id);
        return NextResponse.json(newPost, { status: 201 });
      } catch (createError) {
        console.error('[API] Error creating blog post:', createError);
        return NextResponse.json(
          { error: 'Database error while creating post', details: (createError as Error).message },
          { status: 500 }
        );
      }
    } catch (jwtError) {
      console.error('[API] JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[API] Unhandled error in POST /api/admin/blog/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Export dynamic config to ensure this is not cached
export const dynamic = 'force-dynamic'; 