'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/i18n';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

interface AdminLoginFormProps {
  locale: Locale;
}

export function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const t = useTranslations('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Log when component mounts
  useEffect(() => {
    console.log('[Login Form] Component mounted');
    
    // Clear any existing tokens on component mount to prevent redirect loops
    const existingToken = Cookies.get('admin_token');
    
    if (existingToken) {
      console.log('[Login Form] Found existing token on login page, clearing to prevent redirect loop');
      Cookies.remove('admin_token', { path: '/' });
      localStorage.removeItem('admin_user');
    } else {
      console.log('[Login Form] No existing token found, clean login state');
    }
  }, []);
  
  // Check if we should redirect based on login success
  useEffect(() => {
    if (loginSuccess) {
      console.log('[Login Form] Login successful, redirecting to dashboard after short delay');
      
      // Check cookie just before redirect
      const token = Cookies.get('admin_token');
      console.log('[Login Form] Token before redirect:', token ? `${token.substring(0, 10)}...` : 'None');
      
      setTimeout(() => {
        const dashboardUrl = `/${locale}/admin/dashboard`;
        console.log(`[Login Form] Executing redirect to: ${dashboardUrl}`);
        window.location.href = dashboardUrl;
      }, 1000); // Slightly longer delay to ensure token is set
    }
  }, [loginSuccess, locale]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[Login Form] Submitting login form for username: ${username}`);
      
      // Call the login API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log(`[Login Form] Login response status: ${response.status}`);
      const data = await response.json();
      
      console.log('[Login Form] Login response:', { 
        status: response.status, 
        success: response.ok,
        message: data.message,
        hasToken: !!data.token
      });
      
      if (!response.ok) {
        throw new Error(data.message || t('login.error'));
      }
      
      // Confirm we have a token
      if (!data.token) {
        console.error('[Login Form] Missing token in successful response');
        throw new Error('Authentication failed - no token received');
      }
      
      console.log('[Login Form] Login successful, storing auth data');
      console.log(`[Login Form] Token received (first 10 chars): ${data.token.substring(0, 10)}...`);
      
      // Clear any existing cookies first
      Cookies.remove('admin_token', { path: '/' });
      
      // Store the token in cookies
      Cookies.set('admin_token', data.token, { 
        expires: 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Verify cookie was set
      const storedToken = Cookies.get('admin_token');
      console.log('[Login Form] Stored token in cookie:', storedToken ? 'Success' : 'Failed');
      if (storedToken) {
        console.log(`[Login Form] Stored token (first 10 chars): ${storedToken.substring(0, 10)}...`);
      }
      
      // Store user info in localStorage for convenience
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      console.log('[Login Form] User data stored in localStorage');
      
      // Set login success state to trigger the redirect effect
      setLoginSuccess(true);
    } catch (err: unknown) {
      console.error('[Login Form] Login error:', err);
      
      // Type guard to check if err is an Error object
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('login.error'));
      }
      
      // Enable dev mode after an error
      if (process.env.NODE_ENV === 'development') {
        setDevMode(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md p-3 text-sm">
          {error}
        </div>
      )}
      
      {loginSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md p-3 text-sm">
          Login successful! Redirecting to dashboard...
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('login.username')}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('login.password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading || loginSuccess}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? t('login.loading') : loginSuccess ? 'Redirecting...' : t('login.submit')}
        </button>
      </div>
      
      {devMode && process.env.NODE_ENV === 'development' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">
            Development Mode Options
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('[Login Form] Using dev login...');
              
              // Create a fake token and user for development
              const token = 'dev_token_123';
              console.log(`[Login Form] Creating dev token: ${token}`);
              
              Cookies.set('admin_token', token, { 
                expires: 7,
                path: '/'
              });
              
              localStorage.setItem('admin_user', JSON.stringify({
                id: 'dev_id',
                username: 'admin',
                name: 'Admin User (Dev)',
                email: 'admin@derakhtekherad.com'
              }));
              
              // Set login success to trigger the redirect effect
              setLoginSuccess(true);
            }}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Skip Login (Dev Only)
          </button>
        </div>
      )}
    </form>
  );
} 