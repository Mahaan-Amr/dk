'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { MobileNav } from './mobile-nav';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { nameKey: 'home', href: `/${locale}` },
    { nameKey: 'courses', href: `/${locale}/courses` },
    { nameKey: 'consultation', href: `/${locale}/consultation` },
    { nameKey: 'blog', href: `/${locale}/blog` },
    { nameKey: 'about', href: `/${locale}/about` },
    { nameKey: 'contact', href: `/${locale}/contact` },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${locale}`} className="text-2xl font-bold text-primary">
                درخت خرد
              </Link>
            </div>
            <div className="hidden sm:mr-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary"
                >
                  {t(item.nameKey)}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <ThemeToggle />
            <LanguageSwitcher />
            <MobileNav 
              isOpen={isMobileMenuOpen} 
              setIsOpen={setIsMobileMenuOpen} 
              navigationItems={navigationItems.map(item => ({
                name: t(item.nameKey),
                href: item.href
              }))}
            />
          </div>
        </div>
      </div>
    </nav>
  );
} 