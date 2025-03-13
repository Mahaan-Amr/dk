'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Locale } from '@/i18n';

interface AuthCheckProps {
  locale: Locale;
  children: React.ReactNode;
}

export function AuthCheck({ locale, children }: AuthCheckProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check for auth token
    const checkAuth = () => {
      const token = Cookies.get('admin_token');
      const userJson = localStorage.getItem('admin_user');
      
      console.log('Auth check: token exists:', !!token);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push(`/${locale}/admin/login`);
        return;
      }
      
      // Verify user data exists
      if (!userJson) {
        console.log('No user data found, redirecting to login');
        // Clear invalid token
        Cookies.remove('admin_token');
        router.push(`/${locale}/admin/login`);
        return;
      }
      
      try {
        // Parse user data to ensure it's valid
        JSON.parse(userJson);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Invalid user data in localStorage:', e);
        // Clear invalid data
        Cookies.remove('admin_token');
        localStorage.removeItem('admin_user');
        router.push(`/${locale}/admin/login`);
        return;
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Check auth state when window is focused (in case of token expiration)
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [locale, router]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  // Render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
} 