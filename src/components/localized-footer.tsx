'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export function LocalizedFooter() {
  const t = useTranslations('footer');
  const locale = useLocale();

  const quickLinks = [
    { name: t('home'), href: `/${locale}` },
    { name: t('courses'), href: `/${locale}/courses` },
    { name: t('consultation'), href: `/${locale}/consultation` },
    { name: t('blog'), href: `/${locale}/blog` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('about')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('contactInfo')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>{t('address')}</li>
              <li>{t('phone')}</li>
              <li>{t('email')}</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
} 