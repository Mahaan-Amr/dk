'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { Locale } from '@/i18n';
import { FiClock, FiUser, FiFolder } from 'react-icons/fi';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

// Blog post preview types
interface LocalizedContent {
  title: string;
  summary: string;
  content: string;
}

interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

interface BlogPost {
  _id: string;
  slug: string;
  content: {
    [key in Locale]: LocalizedContent;
  };
  categories: { _id: string; name: { [key in Locale]: string }; slug: string }[];
  featuredImage?: string;
  seoMetadata: {
    [key in Locale]: SEOMetadata;
  };
  status: 'draft' | 'published' | 'archived';
  publishDate?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  author: { name: string; _id: string };
}

export default function BlogPostPreview() {
  const params = useParams<{ locale: string; id: string }>();
  
  // If params are missing, show the 404 page
  if (!params || !params.locale || !params.id) {
    notFound();
  }
  
  const locale = params.locale as Locale;
  const id = params.id;
  const t = useTranslations('blog');

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/blog/preview/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        console.error('Error fetching post preview:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-xl">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h1 className="text-xl text-red-600 dark:text-red-400">{t('error')}</h1>
          <p>{error || t('notFound')}</p>
        </div>
      </div>
    );
  }

  const content = post.content[locale];

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Preview badge */}
      <div className="bg-amber-100 dark:bg-amber-800/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-md mb-6 flex items-center justify-between">
        <span className="font-medium">{t('previewMode')}</span>
        <span className="text-sm">{t('previewNotice')}</span>
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Featured image */}
        {post.featuredImage && (
          <div className="relative h-[40vh] w-full mb-8 rounded-xl overflow-hidden">
            <PlaceholderImage
              src={post.featuredImage}
              alt={content.title}
              fill
              className="object-cover rounded-xl"
              priority
              category="blog"
            />
          </div>
        )}

        {/* Title and metadata */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{content.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center">
              <FiClock className="mr-2" />
              <time dateTime={post.publishDate || post.createdAt}>
                {new Date(post.publishDate || post.createdAt).toLocaleDateString(
                  locale === 'fa' ? 'fa-IR' : 'de-DE',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </time>
            </div>
            
            <div className="flex items-center">
              <FiUser className="mr-2" />
              <span>{post.author?.name || t('unknownAuthor')}</span>
            </div>
            
            {post.categories && post.categories.length > 0 && (
              <div className="flex items-center">
                <FiFolder className="mr-2" />
                <div className="flex flex-wrap gap-2">
                  {post.categories.map(category => (
                    <span key={category._id} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      {category.name[locale]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Summary */}
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 border-l-4 border-primary pl-4 italic">
            {content.summary}
          </p>
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert prose-headings:text-primary prose-a:text-secondary max-w-none"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </article>
    </div>
  );
} 