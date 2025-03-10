'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { LocalizedFooter } from './localized-footer';

interface LocaleLayoutClientWrapperProps {
  children: ReactNode;
  locale: string;
}

export function LocaleLayoutClientWrapper({ 
  children, 
  locale 
}: LocaleLayoutClientWrapperProps) {
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for the current locale
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const messages = await import(`@/messages/${locale}.json`);
        setMessages(messages.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages({});
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <LocalizedFooter />
    </NextIntlClientProvider>
  );
} 