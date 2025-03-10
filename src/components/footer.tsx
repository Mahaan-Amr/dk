'use client';

import Link from 'next/link';

const quickLinks = [
  { name: 'خانه', href: '/' },
  { name: 'دوره‌ها', href: '/courses' },
  { name: 'مشاوره', href: '/consultation' },
  { name: 'وبلاگ', href: '/blog' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
];

const contactInfo = {
  address: 'شیراز، خیابان ملاصدرا، ساختمان درخت خرد، طبقه دوم',
  phone: '۰۷۱-۳۲۳۴۵۶۷۸',
  email: 'info@derakhtkherad.com',
  workingHours: 'شنبه تا پنجشنبه: ۹ صبح تا ۷ عصر',
};

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              درخت خرد
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              موسسه زبان درخت خرد با هدف ارائه آموزش‌های با کیفیت زبان آلمانی و خدمات مشاوره مهاجرت در شیراز
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              دسترسی سریع
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary-red dark:hover:text-primary-red text-sm"
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
              اطلاعات تماس
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>{contactInfo.address}</li>
              <li>تلفن: {contactInfo.phone}</li>
              <li>ایمیل: {contactInfo.email}</li>
              <li>{contactInfo.workingHours}</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} درخت خرد. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
