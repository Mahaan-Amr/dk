'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.serverError');
  const locale = useLocale();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-gray-900">
      <div className="text-center">
        {/* Error symbol */}
        <div className="text-6xl sm:text-9xl text-primary mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        {/* Error message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('title')}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t('description')}
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-secondary transition-colors duration-300"
          >
            Try again
          </button>
          
          <Link
            href={`/${locale}`}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            {t('button')}
          </Link>
        </div>
      </div>
    </div>
  );
} 