import { Locale } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

// Admin login page component
export default async function AdminLoginPage({
  params,
}: {
  params: { locale: Locale };
}) {
  // Use locale directly from params (not a Promise)
  const { locale } = params;
  
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale);
  
  console.log(`[Login Page] Rendering login page for locale: ${locale}`);
  
  // Get translations for the page
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  // Render the login form - token validation will be handled client-side
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {t('login.title')}
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            {t('login.description')}
          </p>
          
          <AdminLoginForm locale={locale} />
        </div>
      </div>
    </main>
  );
} 