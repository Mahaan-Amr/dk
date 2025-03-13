import { Locale } from '@/i18n';
import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

// Admin dashboard page component
export default async function AdminPage({
  params,
}: {
  params: { locale: Locale };
}) {
  // Use locale directly from params (not a Promise)
  const { locale } = params;
  
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale);
  
  // TODO: Implement authentication check
  // For now, we'll just redirect to a "login" page that we'll create next
  // In a real implementation, we would check if the user is authenticated
  // and has admin permissions
  redirect(`/${locale}/admin/login`);

  // Once authentication is implemented, we'll return the actual dashboard
  // return (
  //   <main className="container mx-auto px-4 py-8">
  //     <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  //       {/* Dashboard cards go here */}
  //     </div>
  //   </main>
  // );
} 