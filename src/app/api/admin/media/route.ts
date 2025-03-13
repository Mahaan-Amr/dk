import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getMediaModel from '@/models/Media';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { success, message } = await verifyAuth(req);
    if (!success) {
      return NextResponse.json({ error: message || 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();
    const Media = getMediaModel();

    // Parse query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchQuery = searchParams.get('search') || '';
    const mimeType = searchParams.get('type') || '';

    // Build query
    interface MediaQuery {
      isDeleted: boolean;
      $or?: Array<Record<string, { $regex: string; $options: string }>>;
      mimetype?: { $regex: string; $options: string };
    }
    
    const query: MediaQuery = { isDeleted: false };
    
    if (searchQuery) {
      query.$or = [
        { filename: { $regex: searchQuery, $options: 'i' } },
        { originalFilename: { $regex: searchQuery, $options: 'i' } },
        { title: { $regex: searchQuery, $options: 'i' } },
        { alt: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Filter by media type
    if (mimeType) {
      switch(mimeType) {
        case 'image':
          query.mimetype = { $regex: '^image/', $options: 'i' };
          break;
        case 'video':
          query.mimetype = { $regex: '^video/', $options: 'i' };
          break;
        case 'audio':
          query.mimetype = { $regex: '^audio/', $options: 'i' };
          break;
        case 'document':
          // Documents include PDFs, Office files, text files, etc.
          query.mimetype = { 
            $regex: '(application/pdf|application/msword|application/vnd.openxmlformats-officedocument|text/plain|application/vnd.ms-excel|application/vnd.ms-powerpoint)', 
            $options: 'i' 
          };
          break;
        // No default needed - if type doesn't match, no filter is applied
      }
    }

    // Count total matching documents
    const total = await Media.countDocuments(query);
    
    // Fetch media with pagination
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    // Format the response
    return NextResponse.json({
      media: media.map(item => ({
        id: item._id,
        filename: item.filename,
        originalFilename: item.originalFilename,
        url: item.url,
        mimetype: item.mimetype,
        size: item.size,
        width: item.width,
        height: item.height,
        alt: item.alt,
        title: item.title,
        createdAt: item.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error listing media:', err);
    return NextResponse.json(
      { error: 'Error listing media', details: err.message },
      { status: 500 }
    );
  }
} 