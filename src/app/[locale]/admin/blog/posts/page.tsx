import { Locale } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogPostList } from '@/components/admin/blog/BlogPostList';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

// Blog posts list page component
export default async function BlogPostsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  // Use locale directly from params (not a Promise)
  const { locale } = params;
  
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale);
  
  // Get translations for the page
  const t = await getTranslations({ locale, namespace: 'adminblog' });
  
  return (
    <AdminLayout locale={locale} currentPage="blog">
      <AdminHeader 
        title={t('posts.title')}
        description={t('posts.description')}
      />
      
      <div className="mt-6">
        <BlogPostList locale={locale} />
      </div>
    </AdminLayout>
  );
} 