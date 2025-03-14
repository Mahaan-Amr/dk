import { Locale } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BlogCategoryList } from '@/components/admin/blog/BlogCategoryList';
import { Metadata } from 'next';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

type PageParams = {
  locale: Locale;
};

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: PageParams 
}): Promise<Metadata> {
  // Set the locale for metadata
  unstable_setRequestLocale(params.locale);
  
  // Get translations
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'adminblog'
  });
  
  return {
    title: t('categories.title'),
    description: t('categories.description')
  };
}

type Props = {
  params: PageParams;
};

// Blog categories page component
export default async function BlogCategoriesPage({ params }: Props) {
  // Set the locale for this request
  unstable_setRequestLocale(params.locale);
  
  // Get translations for the page
  const t = await getTranslations({ locale: params.locale, namespace: 'adminblog' });
  
  return (
    <AdminLayout locale={params.locale} currentPage="blog">
      <AdminHeader 
        title={t('categories.title')}
        description={t('categories.description')}
      />
      
      <div className="mt-6">
        <BlogCategoryList locale={params.locale} />
      </div>
    </AdminLayout>
  );
} 