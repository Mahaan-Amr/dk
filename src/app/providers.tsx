'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  locale?: string;
  messages?: AbstractIntlMessages;
}

export function Providers({ children, locale = 'fa', messages = {} }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
} 