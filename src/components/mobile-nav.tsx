'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
}

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navigationItems?: NavigationItem[];
}

// Default navigation items as fallback
const defaultNavigationItems = [
  { name: 'خانه', href: '/' },
  { name: 'دوره‌ها', href: '/courses' },
  { name: 'مشاوره', href: '/consultation' },
  { name: 'وبلاگ', href: '/blog' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
];

export function MobileNav({ isOpen, setIsOpen, navigationItems = defaultNavigationItems }: MobileNavProps) {
  return (
    <>
      <button
        type="button"
        className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">باز کردن منو</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative w-full max-w-xs mr-auto flex h-full flex-col overflow-y-auto bg-white dark:bg-gray-900 py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">منو</h2>
                  <button
                    type="button"
                    className="mr-4 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">بستن منو</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
} 