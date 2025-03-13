'use client';

import { useTranslations } from 'next-intl';
import { StickyHeader } from '@/components/sticky-header';

// Import the CharterCard component from page file
type CharterCardProps = {
  title: string;
  principles: Array<{ title: string; description: string }> | Record<string, unknown>;
};

function CharterCard({ title, principles }: CharterCardProps) {
  // Ensure principles is an array before mapping
  const principlesArray = Array.isArray(principles) ? principles : [];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-10">
      <div className="bg-primary py-4 px-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="p-6">
        <ul className="space-y-6">
          {principlesArray.map((principle, index) => (
            <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">
                  {index + 1}
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{principle.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-11">{principle.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Define our principles data creator function
function createPrinciplesArrays(t: ReturnType<typeof useTranslations>) {
  // Create arrays for our principles
  const educationalPrinciples = [];
  const ethicalPrinciples = [];
  const studentPrinciples = [];
  
  // Helper function to safely get translation or return empty string
  const safeTranslate = (key: string) => {
    try {
      return t(key);
    } catch {
      return '';
    }
  };
  
  // Populate principles arrays safely
  for (let i = 0; i < 5; i++) {
    // Educational principles
    const edTitle = safeTranslate(`educationalCharter.principles.${i}.title`);
    const edDesc = safeTranslate(`educationalCharter.principles.${i}.description`);
    
    if (edTitle && edDesc) {
      educationalPrinciples.push({
        title: edTitle,
        description: edDesc
      });
    }
    
    // Ethical principles
    const ethTitle = safeTranslate(`ethicalCharter.principles.${i}.title`);
    const ethDesc = safeTranslate(`ethicalCharter.principles.${i}.description`);
    
    if (ethTitle && ethDesc) {
      ethicalPrinciples.push({
        title: ethTitle,
        description: ethDesc
      });
    }
    
    // Student principles
    const stuTitle = safeTranslate(`studentCharter.principles.${i}.title`);
    const stuDesc = safeTranslate(`studentCharter.principles.${i}.description`);
    
    if (stuTitle && stuDesc) {
      studentPrinciples.push({
        title: stuTitle,
        description: stuDesc
      });
    }
  }
  
  return {
    educationalPrinciples,
    ethicalPrinciples,
    studentPrinciples
  };
}

export function ChartersContent() {
  // Get translations without try/catch - let Next.js handle loading states
  const t = useTranslations('charters');
  
  // Create principle arrays using our helper function
  const { educationalPrinciples, ethicalPrinciples, studentPrinciples } = createPrinciplesArrays(t);
  
  return (
    <>
      <StickyHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section with Decorative Background */}
        <div className="relative overflow-hidden rounded-xl mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-darker opacity-90 z-10"></div>
          <div className="relative z-20 py-16 px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('title')}</h1>
            <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">{t('subtitle')}</p>
          </div>
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-primary opacity-10 pattern-dots"></div>
          </div>
        </div>
        
        {/* Introduction Text */}
        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('intro')}
          </p>
        </div>
        
        {/* Educational Charter */}
        <section className="mb-12">
          <CharterCard 
            title={t('educationalCharter.title')} 
            principles={educationalPrinciples}
          />
        </section>
        
        {/* Ethical Charter */}
        <section className="mb-12">
          <CharterCard 
            title={t('ethicalCharter.title')} 
            principles={ethicalPrinciples}
          />
        </section>
        
        {/* Student Rights Charter */}
        <section className="mb-12">
          <CharterCard 
            title={t('studentCharter.title')} 
            principles={studentPrinciples}
          />
        </section>
        
        {/* Our Commitment Section */}
        <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border-l-4 border-primary">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('commitmentSection.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('commitmentSection.content')}
          </p>
        </section>
        
        {/* Signature Section */}
        <div className="mt-12 text-right">
          <div className="inline-block text-center">
            <div className="h-20 w-44 mx-auto mb-2 border-b-2 border-primary flex items-end justify-center pb-2">
              <p className="text-xl font-script text-primary">Mohammad Ahmadi</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Dr. Mohammad Ahmadi</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Director, Derakhte Kherad Institute</p>
          </div>
        </div>
      </div>
    </>
  );
} 