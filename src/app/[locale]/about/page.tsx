'use client';

import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/animated-section';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingChat />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary via-[#690000] to-[#500000] text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade" direction="up">
            <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
            <p className="text-xl max-w-3xl mx-auto">{t('subtitle')}</p>
          </AnimatedSection>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* History Section */}
          <AnimatedSection animation="fade" direction="left">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">{t('history.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300">{t('history.description')}</p>
              
              <div className="mt-6 relative">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">Institution Image</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
          
          {/* Mission Section */}
          <AnimatedSection animation="fade" direction="right" delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">{t('mission.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300">{t('mission.description')}</p>
              
              <div className="mt-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Qualitätssicherung bei allen Kursen</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Individuelle Betreuung für jeden Studenten</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Kontinuierliche Verbesserung unserer Methoden</span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>
        
        {/* Team Section */}
        <AnimatedSection animation="fade" direction="up" delay={0.4} className="mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">{t('team.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-10 max-w-3xl mx-auto">{t('team.description')}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team members would go here - this is a placeholder */}
              {[1, 2, 3].map((index) => (
                <div key={index} className="text-center">
                  <div className="h-40 w-40 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dr. Name {index}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
} 