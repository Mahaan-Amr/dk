'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FaCalendar, FaTag, FaUser } from 'react-icons/fa';
import { PlaceholderImage } from '../ui/placeholder-image';

interface BlogPostCardProps {
  id: string;
  titleKey: string;
  summaryKey: string;
  authorKey: string;
  categoryKey: string;
  imageUrl: string;
  date: string;
  locale: string;
  categoryRaw?: string;
}

export function BlogPostCard({
  id,
  titleKey,
  summaryKey,
  authorKey,
  categoryKey,
  imageUrl,
  date,
  locale,
  categoryRaw = 'default'
}: BlogPostCardProps) {
  const t = useTranslations();
  
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

  // Extract category from categoryKey (e.g., 'blog.categories.language' -> 'language')
  const getCategoryName = (key: string): string => {
    const parts = key.split('.');
    return parts[parts.length - 1] || categoryRaw;
  };

  return (
    <Link
      href={`/${locale}/blog/${id}`}
      className="group block"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
        <div className="h-48 overflow-hidden">
          <PlaceholderImage
            src={imageUrl}
            alt={t(titleKey)}
            category={getCategoryName(categoryKey)}
            fill
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-4">
            <div className="flex items-center gap-1">
              <FaCalendar className="w-3 h-3" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaTag className="w-3 h-3" />
              <span>{t(categoryKey)}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
            {t(titleKey)}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3 flex-grow">
            {t(summaryKey)}
          </p>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <FaUser className="w-3 h-3 mr-1" />
            <span>{t(authorKey)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 