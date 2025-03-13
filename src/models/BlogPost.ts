import mongoose, { Schema, Document, Model } from 'mongoose';
import { Locale } from '@/i18n';

// Define interfaces for strongly typed schema
export interface LocalizedContent {
  title: string;
  summary: string;
  content: string;
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

// Define a revision interface for post history
export interface Revision {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  content: {
    [key in Locale]?: LocalizedContent;
  };
  seoMetadata?: {
    [key in Locale]?: SEOMetadata;
  };
  categories?: mongoose.Types.ObjectId[];
  featuredImage?: string;
  status?: 'draft' | 'published' | 'archived';
  modifiedBy: mongoose.Types.ObjectId;
  notes?: string;
}

// Preview interface for temporary previews
export interface Preview {
  id: string;
  expiresAt: Date;
}

export interface IBlogPost extends Document {
  slug: string;
  content: {
    [key in Locale]: LocalizedContent;
  };
  author: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  featuredImage?: string;
  seoMetadata: {
    [key in Locale]: SEOMetadata;
  };
  status: 'draft' | 'published' | 'archived';
  publishDate?: Date;
  scheduledPublishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  isDeleted: boolean;
  revisions: Revision[];
  preview?: Preview;
}

// Define the schema
const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      fa: {
        title: { type: String, required: true },
        summary: { type: String, required: true },
        content: { type: String, required: true },
      },
      de: {
        title: { type: String, required: true },
        summary: { type: String, required: true },
        content: { type: String, required: true },
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Admin', // Reference to Admin model
      required: true,
    },
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
    }],
    featuredImage: {
      type: String,
    },
    seoMetadata: {
      fa: {
        title: String,
        description: String,
        keywords: [String],
        ogImage: String,
      },
      de: {
        title: String,
        description: String,
        keywords: [String],
        ogImage: String,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishDate: {
      type: Date,
    },
    scheduledPublishDate: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // New fields for revision history
    revisions: [{
      date: { type: Date, default: Date.now },
      content: {
        fa: {
          title: String,
          summary: String,
          content: String,
        },
        de: {
          title: String,
          summary: String,
          content: String,
        },
      },
      seoMetadata: {
        fa: {
          title: String,
          description: String,
          keywords: [String],
          ogImage: String,
        },
        de: {
          title: String,
          description: String,
          keywords: [String],
          ogImage: String,
        },
      },
      categories: [{ type: Schema.Types.ObjectId, ref: 'BlogCategory' }],
      featuredImage: String,
      status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
      },
      modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
      },
      notes: String,
    }],
    // Preview data for temporary previews
    preview: {
      id: String,
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to set publishDate when status changes to published
BlogPostSchema.pre('save', function(next) {
  // If the post is being published for the first time, set the publish date
  if (this.isModified('status') && this.status === 'published' && !this.publishDate) {
    // If there's a scheduled publish date in the future, use that
    if (this.scheduledPublishDate && new Date(this.scheduledPublishDate) > new Date()) {
      this.publishDate = this.scheduledPublishDate;
    } else {
      // Otherwise, publish immediately
      this.publishDate = new Date();
    }
  }
  next();
});

// Middleware to create a revision when the post is modified
BlogPostSchema.pre('save', function(next) {
  // Only create a revision if this is not a new document and content has been modified
  if (!this.isNew && (
    this.isModified('content') || 
    this.isModified('seoMetadata') || 
    this.isModified('categories') || 
    this.isModified('featuredImage') || 
    this.isModified('status')
  )) {
    // Create a new revision
    const revision: Revision = {
      date: new Date(),
      content: this.content,
      seoMetadata: this.seoMetadata,
      categories: this.categories,
      featuredImage: this.featuredImage,
      status: this.status,
      modifiedBy: this.author, // Assuming author is the current user
    };
    
    // Add revision to the revisions array
    if (!this.revisions) {
      this.revisions = [];
    }
    this.revisions.push(revision);
    
    // Cap the number of revisions to keep (e.g., keep only the last 10)
    const MAX_REVISIONS = 10;
    if (this.revisions.length > MAX_REVISIONS) {
      this.revisions = this.revisions.slice(-MAX_REVISIONS);
    }
  }
  next();
});

// Create a scheduled task to publish posts at scheduled date
// This would be called by a cron job or similar mechanism
BlogPostSchema.statics.publishScheduledPosts = async function() {
  const now = new Date();
  const result = await this.updateMany(
    { 
      status: 'draft', 
      scheduledPublishDate: { $lte: now },
      isDeleted: false 
    },
    { 
      $set: { 
        status: 'published',
        publishDate: now
      },
      $unset: { scheduledPublishDate: 1 }
    }
  );
  return result;
};

// Create or get the model
function getBlogPostModel(): Model<IBlogPost> {
  return mongoose.models.BlogPost as Model<IBlogPost> || 
    mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
}

export default getBlogPostModel; 