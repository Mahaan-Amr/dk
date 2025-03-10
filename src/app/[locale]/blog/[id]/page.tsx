'use client';

import { useState, useEffect } from 'react';
import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaUser,
  FaCalendar,
  FaTag,
  FaShare,
  FaWhatsapp,
  FaTelegram,
  FaTwitter,
  FaLink,
  FaArrowLeft
} from 'react-icons/fa';

// Sample blog posts data
const allBlogPosts = [
  {
    id: '1',
    titleKey: 'blog.posts.post1.title',
    summaryKey: 'blog.posts.post1.summary',
    authorKey: 'blog.authors.author1',
    categoryKey: 'blog.categories.language',
    imageUrl: '/images/blog/testdaf-guide.jpg',
    date: '2024-03-15',
  },
  {
    id: '2',
    titleKey: 'blog.posts.post2.title',
    summaryKey: 'blog.posts.post2.summary',
    authorKey: 'blog.authors.author2',
    categoryKey: 'blog.categories.immigration',
    imageUrl: '/images/blog/german-visa.jpg',
    date: '2024-03-10',
  },
  {
    id: '3',
    titleKey: 'blog.posts.post3.title',
    summaryKey: 'blog.posts.post3.summary',
    authorKey: 'blog.authors.author3',
    categoryKey: 'blog.categories.culture',
    imageUrl: '/images/blog/culture-differences.jpg',
    date: '2024-03-05',
  },
];

// Post content for each post (in a real app this would come from an API or CMS)
const postContents = {
  '1': {
    paragraphs: [
      { key: 'blog.posts.post1.content.p1' },
      { key: 'blog.posts.post1.content.p2' },
      { key: 'blog.posts.post1.content.p3' },
      { key: 'blog.posts.post1.content.p4' },
    ],
    subheadings: [
      { key: 'blog.posts.post1.content.h1', paragraphKeys: ['blog.posts.post1.content.h1p1', 'blog.posts.post1.content.h1p2'] },
      { key: 'blog.posts.post1.content.h2', paragraphKeys: ['blog.posts.post1.content.h2p1', 'blog.posts.post1.content.h2p2'] },
      { key: 'blog.posts.post1.content.h3', paragraphKeys: ['blog.posts.post1.content.h3p1', 'blog.posts.post1.content.h3p2'] },
    ]
  },
  '2': {
    paragraphs: [
      { key: 'blog.posts.post2.content.p1' },
      { key: 'blog.posts.post2.content.p2' },
      { key: 'blog.posts.post2.content.p3' },
      { key: 'blog.posts.post2.content.p4' },
    ],
    subheadings: [
      { key: 'blog.posts.post2.content.h1', paragraphKeys: ['blog.posts.post2.content.h1p1', 'blog.posts.post2.content.h1p2'] },
      { key: 'blog.posts.post2.content.h2', paragraphKeys: ['blog.posts.post2.content.h2p1', 'blog.posts.post2.content.h2p2'] },
      { key: 'blog.posts.post2.content.h3', paragraphKeys: ['blog.posts.post2.content.h3p1', 'blog.posts.post2.content.h3p2'] },
    ]
  },
  '3': {
    paragraphs: [
      { key: 'blog.posts.post3.content.p1' },
      { key: 'blog.posts.post3.content.p2' },
      { key: 'blog.posts.post3.content.p3' },
      { key: 'blog.posts.post3.content.p4' },
    ],
    subheadings: [
      { key: 'blog.posts.post3.content.h1', paragraphKeys: ['blog.posts.post3.content.h1p1', 'blog.posts.post3.content.h1p2'] },
      { key: 'blog.posts.post3.content.h2', paragraphKeys: ['blog.posts.post3.content.h2p1', 'blog.posts.post3.content.h2p2'] },
      { key: 'blog.posts.post3.content.h3', paragraphKeys: ['blog.posts.post3.content.h3p1', 'blog.posts.post3.content.h3p2'] },
    ]
  }
};

interface BlogPost {
  id: string;
  titleKey: string;
  summaryKey: string;
  authorKey: string;
  categoryKey: string;
  imageUrl: string;
  date: string;
}

export default function BlogPostPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch data from API
    // For now, we use the mock data
    const foundPost = allBlogPosts.find(p => p.id === postId);
    
    if (foundPost) {
      setPost(foundPost);
      
      // Find related posts (posts with the same category but not the current post)
      setRelatedPosts(
        allBlogPosts
          .filter(p => p.id !== postId && p.categoryKey === foundPost.categoryKey)
          .slice(0, 2)
      );
    }
    setLoading(false);
  }, [postId]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareButtons = [
    {
      icon: FaWhatsapp,
      label: t('common.share.whatsapp'),
      onClick: () => shareUrl && window.open(`https://wa.me/?text=${encodeURIComponent(`${post ? t(post.titleKey) : ''}\n${shareUrl}`)}`, '_blank'),
      color: 'bg-green-500'
    },
    {
      icon: FaTelegram,
      label: t('common.share.telegram'),
      onClick: () => shareUrl && window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post ? t(post.titleKey) : '')}`, '_blank'),
      color: 'bg-blue-500'
    },
    {
      icon: FaTwitter,
      label: t('common.share.twitter'),
      onClick: () => shareUrl && window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post ? t(post.titleKey) : ''}\n${shareUrl}`)}`, '_blank'),
      color: 'bg-sky-500'
    },
    {
      icon: FaLink,
      label: t('common.share.copyLink'),
      onClick: () => {
        if (shareUrl) {
          navigator.clipboard.writeText(shareUrl);
          alert(t('common.share.copied'));
        }
      },
      color: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <StickyHeader />
        <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('blog.postNotFound')}
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {t('blog.postNotFoundDesc')}
          </p>
          <Link 
            href={`/${locale}/blog`}
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition duration-300"
          >
            <span className="flex items-center gap-2">
              <FaArrowLeft />
              {t('blog.backToBlog')}
            </span>
          </Link>
        </main>
      </div>
    );
  }

  const postContent = postContents[postId as keyof typeof postContents];

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingChat />
      
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:py-12">
        {/* Back to Blog */}
        <div className="mb-8">
          <Link 
            href={`/${locale}/blog`}
            className="text-primary hover:text-primary-dark flex items-center gap-2 transition duration-300"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>{t('blog.backToBlog')}</span>
          </Link>
        </div>
        
        {/* Blog Post Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t(post.titleKey)}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <FaUser className="w-4 h-4" />
              <span>{t(post.authorKey)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar className="w-4 h-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTag className="w-4 h-4" />
              <span>{t(post.categoryKey)}</span>
            </div>
            <div className="relative ml-auto">
              <button
                className="flex items-center gap-1 text-primary"
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                <FaShare className="w-4 h-4" />
                <span>{t('blog.share')}</span>
              </button>
              {showShareOptions && (
                <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 flex flex-col gap-2 min-w-[150px]">
                  {shareButtons.map((button, index) => (
                    <button
                      key={index}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-white ${button.color}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        button.onClick();
                      }}
                    >
                      <button.icon className="w-4 h-4" />
                      <span className="text-sm">{button.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Featured Image */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt={t(post.titleKey)}
            className="w-full h-auto object-cover"
          />
        </div>
        
        {/* Post Content */}
        <div className="prose max-w-none dark:prose-invert mb-12">
          {/* Summary */}
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {t(post.summaryKey)}
          </p>
          
          {/* Main Content */}
          {postContent.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              {/* Using a fallback text since we don't have actual translations for these keys */}
              {t.raw(paragraph.key) || `${paragraph.key} - This is a placeholder for the actual paragraph content that would be loaded from the translation files. In a real implementation, each paragraph would have its complete text in the appropriate language.`}
            </p>
          ))}
          
          {/* Subheadings and their paragraphs */}
          {postContent.subheadings.map((subheading, index) => (
            <div key={index} className="mt-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {/* Using a fallback text since we don't have actual translations for these keys */}
                {t.raw(subheading.key) || `${subheading.key} - Subheading ${index + 1}`}
              </h2>
              
              {subheading.paragraphKeys.map((paraKey, paraIndex) => (
                <p key={paraIndex} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {/* Using a fallback text since we don't have actual translations for these keys */}
                  {t.raw(paraKey) || `${paraKey} - This is content under subheading ${index + 1}, paragraph ${paraIndex + 1}.`}
                </p>
              ))}
            </div>
          ))}
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('blog.relatedPosts')}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/${locale}/blog/${relatedPost.id}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform group-hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedPost.imageUrl}
                        alt={t(relatedPost.titleKey)}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors group-hover:text-primary">
                        {t(relatedPost.titleKey)}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {t(relatedPost.summaryKey)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 