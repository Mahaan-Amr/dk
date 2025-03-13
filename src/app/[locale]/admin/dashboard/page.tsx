import { Locale } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminHeader } from '@/components/admin/admin-header';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { AdminLayout } from '@/components/admin/admin-layout';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [{ locale: 'fa' }, { locale: 'de' }];
}

// Function to verify token on the server side
async function verifyToken(token: string): Promise<boolean> {
  try {
    // Get the JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    console.log(`[Dashboard] Verifying token with secret: ${jwtSecret.substring(0, 3)}...`);
    
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    console.log(`[Dashboard] Token verified successfully:`, decoded);
    return true;
  } catch (error) {
    console.error(`[Dashboard] Token verification failed:`, error);
    return false;
  }
}

// Admin dashboard page component
export default async function AdminDashboardPage({
  params,
}: {
  params: { locale: Locale };
}) {
  // Use locale directly from params (not a Promise)
  const { locale } = params;
  
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale);
  
  console.log(`[Dashboard] Rendering dashboard for locale: ${locale}`);
  
  // Check for token and verify it on the server side
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  
  if (!adminToken?.value) {
    console.log(`[Dashboard] No token found, redirecting to login`);
    redirect(`/${locale}/admin/login`);
  }
  
  console.log(`[Dashboard] Found token (first 10 chars): ${adminToken.value.substring(0, 10)}...`);
  
  // Check for development token
  if (process.env.NODE_ENV === 'development' && (
    adminToken.value === 'dev_token_123' || 
    adminToken.value === 'dev_token_123456789'
  )) {
    console.log(`[Dashboard] Accepting development token`);
  } else {
    // Verify the token (this runs in Node.js environment, not Edge)
    const isValid = await verifyToken(adminToken.value);
    
    if (!isValid) {
      console.log(`[Dashboard] Token validation failed, redirecting to login`);
      redirect(`/${locale}/admin/login`);
    }
  }
  
  console.log(`[Dashboard] Authentication successful, rendering dashboard`);
  
  // Get translations for the dashboard
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  // In a real implementation, we would fetch dashboard data here
  const stats = {
    totalCourses: 5,
    activeCourses: 2,
    totalBlogPosts: 12,
    totalUsers: 24,
  };
  
  return (
    <AdminLayout locale={locale} currentPage="dashboard">
      <AdminHeader 
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      
      <div className="mt-6">
        <DashboardStats stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">{t('dashboard.recentCourses')}</h2>
          {/* Recent courses list would go here */}
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('dashboard.noCourses')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">{t('dashboard.recentPosts')}</h2>
          {/* Recent blog posts list would go here */}
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('dashboard.noPosts')}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
} 