'use client';

import { useState } from 'react';
import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { useTranslations } from 'next-intl';
import { DirectionAware } from '@/components/direction-aware';
import { useLocale } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormStatus('submitting');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send the form data to your API here
      console.log('Form submitted:', formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      
      setFormStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingChat />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary via-[#690000] to-[#500000] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto">{t('contact.subtitle')}</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <DirectionAware
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
            swapText={true}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.form.title')}</h2>
            
            {formStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md">
                {t('contact.form.success')}
              </div>
            )}
            
            {formStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">
                {t('contact.form.error')}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-secondary transition-colors duration-300 disabled:opacity-50"
              >
                {formStatus === 'submitting' ? t('contact.form.submitting') : t('contact.form.submit')}
              </button>
            </form>
          </DirectionAware>
          
          {/* Contact Information */}
          <DirectionAware
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
            swapMargin={true}
            swapPadding={true}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.info.title')}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.info.address')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('footer.address')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.info.phone')}</h3>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{locale === 'fa' ? 'تلفن ثابت: ' : 'Tel: '}</span>{t('footer.phone')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{locale === 'fa' ? 'موبایل: ' : 'Mobile: '}</span>{t('footer.mobile')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{locale === 'fa' ? 'واتساپ: ' : 'WhatsApp: '}</span>{t('footer.whatsapp')}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.info.email')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('footer.email')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.info.hours')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('contact.info.weekdays')}: 9:00 - 17:00<br />
                  {t('contact.info.weekend')}: {t('contact.info.closed')}
                </p>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="mt-8 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Google Map will be embedded here</span>
            </div>
          </DirectionAware>
        </div>
      </div>
    </div>
  );
} 