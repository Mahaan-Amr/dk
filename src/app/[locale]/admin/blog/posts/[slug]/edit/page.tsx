import { Locale } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogPostEditor } from '@/components/admin/blog/BlogPostEditor';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

// Blog post edit page component
export default async function BlogPostEditPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  // Use locale and slug directly from params (not a Promise)
  const { locale, slug } = params;
  
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale);
  
  // Get translations for the page
  const t = await getTranslations({ locale, namespace: 'adminblog' });
  
  return (
    <AdminLayout locale={locale} currentPage="blog">
      <AdminHeader 
        title={t('editor.editPost')}
        description={t('editor.editDescription')}
      />
      
      <div className="mt-6">
        <BlogPostEditor locale={locale} slug={slug} />
      </div>
    </AdminLayout>
  );
} 