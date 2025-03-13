import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMediaItem extends Document {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  uploadedBy: mongoose.Types.ObjectId;
  categories?: string[];
  tags?: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
  {
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    alt: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    // New fields for categorization
    categories: [{
      type: String,
    }],
    tags: [{
      type: String,
    }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster search by categories and tags
MediaItemSchema.index({ categories: 1 });
MediaItemSchema.index({ tags: 1 });
MediaItemSchema.index({ isDeleted: 1 });
MediaItemSchema.index({ mimeType: 1 });

// Create or get the model
function getMediaItemModel(): Model<IMediaItem> {
  return mongoose.models.MediaItem as Model<IMediaItem> || 
    mongoose.model<IMediaItem>('MediaItem', MediaItemSchema);
}

export default getMediaItemModel; 