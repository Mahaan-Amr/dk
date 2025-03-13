import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { ChartersContent } from '@/components/charters/charters-content';

// This fixes the "params should be awaited" warning
export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  // Set the locale for this request
  const locale = params.locale;
  await unstable_setRequestLocale(locale);
  
  try {
    const t = await getTranslations({ locale, namespace: 'charters' });
    
    return {
      title: t('title'),
      description: t('subtitle'),
    };
  } catch (e) {
    // Fallback metadata if translations fail
    console.error('Failed to load charters translations:', e);
    return {
      title: 'Charters',
      description: 'Principles and values of our institute',
    };
  }
}

export default async function ChartersPage({
  params
}: {
  params: { locale: string }
}) {
  // Set the locale for this request
  const locale = params.locale;
  await unstable_setRequestLocale(locale);
  
  // Render the client component that will handle the UI
  return <ChartersContent />;
} 