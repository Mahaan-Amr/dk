'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

// Define available languages
const languages = [
  { code: 'fa', name: 'فارسی' },
  { code: 'de', name: 'Deutsch' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Create the new path with the selected locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Use startTransition to prevent blocking the UI during navigation
    startTransition(() => {
      router.push(newPath);
    });
  };

  // Current language display name
  const currentLanguage = languages.find(lang => lang.code === locale)?.name || languages[0].name;

  return (
    <Menu as="div" className="relative inline-block text-right">
      <Menu.Button className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center">
        <GlobeAltIcon className="h-5 w-5 mr-1" aria-hidden="true" />
        <span className="text-sm hidden sm:inline-block">{currentLanguage}</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-36 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={isPending || language.code === locale}
                    className={`${
                      active
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-900 dark:text-gray-100'
                    } ${
                      language.code === locale ? 'font-bold text-primary' : ''
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    {language.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 
