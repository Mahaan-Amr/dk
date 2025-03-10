'use client';

import { useState } from 'react';
import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { DirectionAware } from '@/components/direction-aware';

// Sample blog posts data (in a real app, this would come from an API)
const allPosts = [
  {
    id: '1',
    titleKey: 'blog.posts.post1.title',
    summaryKey: 'blog.posts.post1.summary',
    imageUrl: '/images/blog/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_style_1.jpg',
    date: '2024-03-01',
    authorKey: 'blog.authors.author1',
    categoryKey: 'blog.categories.language',
  },
  {
    id: '2',
    titleKey: 'blog.posts.post2.title',
    summaryKey: 'blog.posts.post2.summary',
    imageUrl: '/images/blog/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_style_2.jpg',
    date: '2024-02-15',
    authorKey: 'blog.authors.author2',
    categoryKey: 'blog.categories.immigration',
  },
  {
    id: '3',
    titleKey: 'blog.posts.post3.title',
    summaryKey: 'blog.posts.post3.summary',
    imageUrl: '/images/blog/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_featur_2.jpg',
    date: '2024-01-20',
    authorKey: 'blog.authors.author3',
    categoryKey: 'blog.categories.culture',
  },
];

// Sample categories
const categories = [
  { key: 'all', labelKey: 'blog.categories.all' },
  { key: 'language', labelKey: 'blog.categories.language' },
  { key: 'immigration', labelKey: 'blog.categories.immigration' },
  { key: 'culture', labelKey: 'blog.categories.culture' },
  { key: 'education', labelKey: 'blog.categories.education' },
];

export default function BlogPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Format date based on locale
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

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.categoryKey.includes(selectedCategory);
    const matchesSearch = t(post.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t(post.summaryKey).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingChat />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary via-[#690000] to-[#500000] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto">{t('blog.subtitle')}</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Search */}
            <div className="mb-8">
              <input
                type="text"
                placeholder={t('blog.search')}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Blog Posts */}
            <div className="space-y-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <DirectionAware 
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
                    swapMargin={true}
                    swapPadding={true}
                  >
                    <div className="md:w-1/3">
                      <div 
                        className="h-48 md:h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${post.imageUrl})` }}
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-primary font-medium">{t(post.categoryKey)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.date)}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(post.titleKey)}</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{t(post.summaryKey)}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('blog.author')}: {t(post.authorKey)}</span>
                        <Link
                          href={`/${locale}/blog/${post.id}`}
                          className="text-primary font-medium hover:text-primary-secondary"
                        >
                          {t('blog.readMore')}
                        </Link>
                      </div>
                    </div>
                  </DirectionAware>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">{t('blog.noPostsFound')}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('blog.categoriesTitle')}</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.key}>
                    <button
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.key
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t(category.labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Recent Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('blog.recentPosts')}</h3>
              <ul className="space-y-4">
                {allPosts.slice(0, 3).map((post) => (
                  <li key={post.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <Link href={`/${locale}/blog/${post.id}`} className="hover:text-primary">
                      <h4 className="font-medium text-gray-900 dark:text-white">{t(post.titleKey)}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(post.date)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 