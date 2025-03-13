import mongoose, { Schema, Document, Model } from 'mongoose';
import { Locale } from '@/i18n';

// Define interfaces for strongly typed schema
export interface IBlogCategory extends Document {
  slug: string;
  name: {
    [key in Locale]: string;
  };
  description: {
    [key in Locale]?: string;
  };
  parent?: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      fa: {
        type: String,
        required: true,
      },
      de: {
        type: String,
        required: true,
      },
    },
    description: {
      fa: String,
      de: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on slug to improve query performance
BlogCategorySchema.index({ slug: 1 });

// Create or get the model
function getBlogCategoryModel(): Model<IBlogCategory> {
  return mongoose.models.BlogCategory as Model<IBlogCategory> || 
    mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema);
}

export default getBlogCategoryModel; 