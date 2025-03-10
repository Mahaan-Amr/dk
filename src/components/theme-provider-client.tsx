'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

interface ThemeProviderClientProps {
  children: ReactNode;
}

export function ThemeProviderClient({ children }: ThemeProviderClientProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  );
} 