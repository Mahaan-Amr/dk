'use client';

import { useState } from 'react';
import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { useTranslations } from 'next-intl';
import { DirectionAware } from '@/components/direction-aware';

// Sample consultation topics
const topics = [
  { key: 'academic', labelKey: 'consultation.topics.academic' },
  { key: 'visa', labelKey: 'consultation.topics.visa' },
  { key: 'language', labelKey: 'consultation.topics.language' },
  { key: 'career', labelKey: 'consultation.topics.career' },
];

export default function ConsultationPage() {
  const t = useTranslations();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: topics[0].key,
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      console.log('Consultation form submitted:', formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        topic: topics[0].key,
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
          <h1 className="text-4xl font-bold mb-4">{t('consultation.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto">{t('consultation.subtitle')}</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Consultation Form */}
          <DirectionAware
            className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
            swapText={true}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('consultation.form.title')}</h2>
            
            {formStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md">
                {t('consultation.form.success')}
              </div>
            )}
            
            {formStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">
                {t('consultation.form.error')}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('consultation.form.name')}
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
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('consultation.form.email')}
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('consultation.form.phone')}
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
                
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('consultation.form.topic')}
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {topics.map((topic) => (
                      <option key={topic.key} value={topic.key}>
                        {t(topic.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('consultation.form.message')}
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
                {formStatus === 'submitting' ? t('consultation.form.submitting') : t('consultation.form.submit')}
              </button>
            </form>
          </DirectionAware>
          
          {/* Consultation Information */}
          <DirectionAware
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
            swapMargin={true}
            swapPadding={true}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('consultation.info.title')}</h2>
            
            <div className="space-y-6">
              {topics.map((topic) => (
                <div key={topic.key} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t(topic.labelKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t(`consultation.info.${topic.key}Description`)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('consultation.info.note')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('consultation.info.noteText')}
              </p>
            </div>
          </DirectionAware>
        </div>
      </div>
    </div>
  );
} 