import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function AdminRedirect() {
  // Redirect to the default locale's admin page
  redirect(`/${defaultLocale}/admin`);
} 