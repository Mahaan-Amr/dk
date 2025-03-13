import { Locale } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogPostEditor } from '@/components/admin/blog/BlogPostEditor';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

// New blog post page component
export default async function NewBlogPostPage({
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
        title={t('editor.createPost')}
        description={t('editor.createDescription')}
      />
      
      <div className="mt-6">
        <BlogPostEditor locale={locale} />
      </div>
    </AdminLayout>
  );
} 