'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';
import { ReactNode } from 'react';

interface NextIntlProviderProps {
  children: ReactNode;
  locale: string;
}

export function NextIntlProvider({ children, locale }: NextIntlProviderProps) {
  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 