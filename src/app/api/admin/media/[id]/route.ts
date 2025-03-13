import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getMediaModel from '@/models/Media';
import { getServerSession } from 'next-auth';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();
    const Media = getMediaModel();

    // Find the media
    const media = await Media.findById(params.id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Soft delete in the database
    media.isDeleted = true;
    await media.save();

    // Try to delete the file physically (but don't error if it fails)
    try {
      const filePath = path.join(process.cwd(), 'public', media.path);
      if (fs.existsSync(filePath)) {
        await promisify(fs.unlink)(filePath);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue even if file deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting media:', err);
    return NextResponse.json(
      { error: 'Error deleting media', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();
    const Media = getMediaModel();

    // Find the media
    const media = await Media.findById(params.id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json({
      media: {
        id: media._id,
        url: media.url,
        filename: media.filename,
        originalFilename: media.originalFilename,
        mimetype: media.mimetype,
        size: media.size,
        width: media.width,
        height: media.height,
        alt: media.alt,
        title: media.title,
        createdAt: media.createdAt,
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching media:', err);
    return NextResponse.json(
      { error: 'Error fetching media', details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();
    const Media = getMediaModel();

    // Get request data
    const data = await req.json();
    const { alt, title } = data;

    // Find and update the media
    const media = await Media.findById(params.id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Update fields
    if (alt !== undefined) media.alt = alt;
    if (title !== undefined) media.title = title;
    
    await media.save();

    return NextResponse.json({
      success: true,
      media: {
        id: media._id,
        url: media.url,
        alt: media.alt,
        title: media.title,
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating media:', err);
    return NextResponse.json(
      { error: 'Error updating media', details: err.message },
      { status: 500 }
    );
  }
} 