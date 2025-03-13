import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getMediaModel from '@/models/Media';

export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();
    const Media = getMediaModel();

    // Fetch the most recent uploads to check if they're working
    const recentMedia = await Media.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Return the most recent media items with detailed information
    return NextResponse.json({
      success: true,
      message: "Media upload test",
      recentMedia: recentMedia.map(item => ({
        id: item._id,
        filename: item.filename,
        originalFilename: item.originalFilename,
        url: item.url,
        path: item.path,
        size: item.size,
        mimetype: item.mimetype,
        width: item.width,
        height: item.height,
        alt: item.alt,
        title: item.title,
        uploadedBy: item.uploadedBy,
        createdAt: item.createdAt,
      })),
      filesystem: {
        uploadDir: process.cwd() + '/public/uploads',
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error testing media:', err);
    return NextResponse.json(
      { error: 'Error testing media', details: err.message },
      { status: 500 }
    );
  }
} 