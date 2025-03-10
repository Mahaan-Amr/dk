import '@/app/globals.css';
import '@fontsource-variable/vazirmatn/index.css';
import { ReactNode } from 'react';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { LocaleLayoutClientWrapper } from '../../components/locale-layout-client-wrapper';
import { locales, Locale } from '@/i18n';

type LocaleParams = Promise<{
  locale: string;
}>;

interface LocaleLayoutProps {
  children: ReactNode;
  params: LocaleParams;
}

// Define which locales are supported
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps) {
  // Get the locale from params
  const { locale } = await params;
  
  // Validate that this is a supported locale
  if (!locales.includes(locale as Locale)) {
    return {
      title: 'Unsupported Locale',
      description: 'This locale is not supported',
    };
  }
  
  // Enable static rendering for this locale in metadata generation
  unstable_setRequestLocale(locale);
  
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // Get the locale from params
  const { locale } = await params;

  // Validate that this is a supported locale
  if (!locales.includes(locale as Locale)) {
    return <div>Unsupported locale</div>;
  }
  
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale);
  
  const isRTL = locale === 'fa';
  
  return (
    <div lang={locale} dir={isRTL ? 'rtl' : 'ltr'} className="contents">
      <LocaleLayoutClientWrapper locale={locale}>
        {children}
      </LocaleLayoutClientWrapper>
    </div>
  );
} 