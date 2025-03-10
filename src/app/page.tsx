import { redirect } from 'next/navigation';

// Redirect from the root to the default locale (Farsi)
export default function RootPage() {
  redirect('/fa');
}
