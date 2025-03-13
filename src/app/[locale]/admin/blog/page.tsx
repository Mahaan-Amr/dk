import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Locale } from '@/i18n';

interface BlogPageProps {
  params: {
    locale: Locale;
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  // Redirect to blog posts page by default
  const locale = params.locale;
  redirect(`/${locale}/admin/blog/posts`);
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogPageProps) {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'adminblog' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}
