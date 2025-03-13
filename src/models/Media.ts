import mongoose, { Schema, Document, Model } from 'mongoose';

// Define interfaces for strongly typed schema
export interface IMedia extends Document {
  filename: string;
  originalFilename: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  uploadedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const MediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve model
function getMediaModel(): Model<IMedia> {
  return mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
}

export default getMediaModel; 