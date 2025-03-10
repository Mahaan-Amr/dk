import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';

// Define the list of available locales for the application
export const locales = ['fa', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fa';

// Create shared pathnames for navigation
export const { Link, redirect, usePathname, useRouter } = 
  createSharedPathnamesNavigation({ locales });

// Function to get translations by locale
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }
  
  // Dynamically import the messages for the requested locale
  const messages = (await import(`./messages/${locale}.json`)).default;
  
  return {
    locale,
    messages,
  };
}); 