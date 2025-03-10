'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors.notFound');
  const locale = useLocale();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-gray-900">
      <div className="text-center">
        {/* Error code */}
        <h1 className="text-6xl sm:text-9xl font-extrabold text-primary mb-4">404</h1>
        
        {/* Error message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('title')}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t('description')}
        </p>
        
        {/* Back to home button */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-secondary transition-colors duration-300"
        >
          {t('button')}
        </Link>
      </div>
    </div>
  );
} 