'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
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
  const [messages, setMessages] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for the current locale
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        
        // Try to load modular section files first
        const sections = ['common', 'frontend', 'admin', 'adminblog', 'blog', 'courses', 'metadata', 'nav', 'footer', 'charters'];
        let mergedMessages: Record<string, unknown> = {};
        let loadedSections = false;
        
        // Try to load each section
        for (const section of sections) {
          try {
            // For filesystem, use section name with hyphen
            const fileSection = section === 'adminblog' ? 'admin-blog' : section;
            
            // Dynamic import with section path
            const sectionModule = await import(`@/messages/${locale}/${fileSection}.json`);
            const sectionMessages = sectionModule.default;
            
            // Handle the 'frontend' section specially - extract the top-level keys
            if (section === 'frontend') {
              // This lets us access frontend.home.xyz as just home.xyz
              mergedMessages = { ...mergedMessages, ...sectionMessages };
            } else {
              // For other sections, keep them under their respective namespace
              mergedMessages = { ...mergedMessages, [section]: sectionMessages };
            }
            
            loadedSections = true;
          } catch {
            console.warn(`Could not load section '${section}' for locale '${locale}'`);
          }
        }
        
        // If no sections were loaded, fall back to the legacy monolithic file
        if (!loadedSections) {
          console.log(`Falling back to legacy translation file for locale '${locale}'`);
          try {
            const legacyModule = await import(`@/messages/${locale}.json`);
            mergedMessages = legacyModule.default;
          } catch {
            console.error(`Failed to load legacy file for locale '${locale}'`);
            
            // Last resort fallback to default locale
            try {
              const fallbackModule = await import(`@/messages/fa.json`);
              mergedMessages = fallbackModule.default;
            } catch {
              // If all else fails, use an empty object
              mergedMessages = {};
            }
          }
        }
        
        setMessages(mergedMessages);
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
    <NextIntlClientProvider locale={locale} messages={messages as AbstractIntlMessages}>
      {children}
      <LocalizedFooter />
    </NextIntlClientProvider>
  );
} 