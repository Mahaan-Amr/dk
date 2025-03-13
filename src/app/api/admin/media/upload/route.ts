import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import getMediaModel from '@/models/Media';
import { verifyAuth } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Configure formidable options
const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  uploadDir: path.join(process.cwd(), 'public/uploads'),
  multiples: true,
  allowEmptyFiles: false,
};

// Ensure upload directory exists
if (!fs.existsSync(formidableConfig.uploadDir)) {
  fs.mkdirSync(formidableConfig.uploadDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  // Create directory for uploads if it doesn't exist
  if (!fs.existsSync(formidableConfig.uploadDir)) {
    fs.mkdirSync(formidableConfig.uploadDir, { recursive: true });
  }
  
  try {
    console.log('Media upload request received');
    
    // Check authentication
    const { success, message, userId } = await verifyAuth(req);
    if (!success) {
      console.log('Authentication failed:', message);
      return NextResponse.json({ error: message || 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Authentication successful');

    // Connect to database
    try {
      await connectToDatabase();
      console.log('Connected to database');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    const Media = getMediaModel();

    // Instead of manually handling streams, use the formidable-serverless approach
    // Create a temporary path for the file
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Get form data through a more direct approach
    const formData = await req.formData();
    console.log('FormData received with entries:', [...formData.keys()]);
    
    // Get the file from formData
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Get additional metadata
    const title = formData.get('title') as string || file.name;
    const alt = formData.get('alt') as string || '';
    
    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Create a unique filename with proper extension
    const fileExtension = path.extname(file.name).toLowerCase();
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const destinationPath = path.join(formidableConfig.uploadDir, uniqueFilename);
    
    // Get the File as ArrayBuffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process image if it's an image file
    let width, height;
    const isImage = file.type.startsWith('image/');
    
    try {
      if (isImage) {
        console.log('Processing image file');
        // Get image dimensions and optimize
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;
        
        // Create optimized version and save
        await sharp(buffer)
          .resize({ 
            width: 1920, 
            height: 1080, 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .toFile(destinationPath);
          
        console.log('Image processed and optimized');
      } else {
        console.log('Processing non-image file');
        // Save the file directly
        await promisify(fs.writeFile)(destinationPath, buffer);
        console.log('File saved to destination');
      }
      
      // Create relative path for URL
      const relativePath = `uploads/${uniqueFilename}`;
      const url = `/uploads/${uniqueFilename}`;
      
      // Get the user id safely
      const userIdentifier = userId || 'unknown-user';
      
      // Save file info to database
      try {
        console.log('Saving file info to database');
        const media = new Media({
          filename: uniqueFilename,
          originalFilename: file.name,
          path: relativePath,
          url,
          size: file.size,
          mimetype: file.type,
          width,
          height,
          alt: alt,
          title: title,
          uploadedBy: userIdentifier,
        });
        
        await media.save();
        console.log('File info saved successfully with ID:', media._id);
        
        return NextResponse.json({
          success: true,
          media: {
            id: media._id,
            filename: media.filename,
            url: media.url,
            width: media.width,
            height: media.height,
            alt: media.alt,
            title: media.title,
          }
        });
      } catch (error: unknown) {
        console.error('Error saving to database:', error);
        const dbError = error as Error;
        return NextResponse.json(
          { error: 'Error saving file info to database', details: dbError.message },
          { status: 500 }
        );
      }
    } catch (error: unknown) {
      console.error('Error processing file:', error);
      const processingError = error as Error;
      return NextResponse.json({ error: 'Error processing file', details: processingError.message }, { status: 500 });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error uploading file:', err);
    
    // Log stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
    
    return NextResponse.json(
      { error: 'Error uploading file', details: err.message },
      { status: 500 }
    );
  }
}

// Disable body parsing, handle it manually
export const config = {
  api: {
    bodyParser: false,
  },
}; 