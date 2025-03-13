'use client';

import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { FloatingTranslator } from '@/components/floating-translator';
import { HeroCarousel } from '@/components/hero-carousel';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { AnimatedSection } from '@/components/animated-section';
import { AnimatedStat } from '@/components/animated-stat';
import { CourseCard } from '@/components/course-card';
import { DirectionAware } from '@/components/direction-aware';
import NetworkBackground from '@/components/NetworkBackground';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

// Define types for the feature
interface Feature {
  title: string;
  description: string;
}

// Sample featured courses
const featuredCourses = [
  {
    id: '1',
    titleKey: 'courses.coursesList.a1.title',
    descriptionKey: 'courses.coursesList.a1.description',
    levelKey: 'courses.levels.beginner',
    teacherKey: 'courses.teachers.mohammadi',
    price: 2500000,
    imageUrl: '',
    startDate: '2024-04-01',
  },
  {
    id: '2',
    titleKey: 'courses.coursesList.b1.title',
    descriptionKey: 'courses.coursesList.b1.description',
    levelKey: 'courses.levels.intermediate',
    teacherKey: 'courses.teachers.rezaei',
    price: 3200000,
    imageUrl: '',
    startDate: '2024-04-15',
  },
  {
    id: '3',
    titleKey: 'courses.coursesList.testdaf.title',
    descriptionKey: 'courses.coursesList.testdaf.description',
    levelKey: 'courses.levels.advanced',
    teacherKey: 'courses.teachers.alavi',
    price: 4500000,
    imageUrl: '',
    startDate: '2024-05-01',
  },
];

// Sample blog posts
const recentPosts = [
  {
    id: '1',
    titleKey: 'blog.posts.post1.title',
    summaryKey: 'blog.posts.post1.summary',
    authorKey: 'blog.authors.author1',
    categoryKey: 'blog.categories.language',
    imageUrl: '',
    date: '2024-03-01',
  },
  {
    id: '2',
    titleKey: 'blog.posts.post2.title',
    summaryKey: 'blog.posts.post2.summary',
    authorKey: 'blog.authors.author2',
    categoryKey: 'blog.categories.immigration',
    imageUrl: '',
    date: '2024-02-15',
  },
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <main className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingTranslator />
      <FloatingChat />
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Why Us Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('home.whyUs.title')}</h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t('home.whyUs.subtitle')}</p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(() => {
              try {
                const features = t.raw('home.whyUs.features');
                if (Array.isArray(features)) {
                  return features.map((feature: Feature, index: number) => (
                    <AnimatedSection key={index} animation="fade" direction="up" delay={index * 0.1}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </AnimatedSection>
                  ));
                }
                // Fallback if features is not an array
                return null;
              } catch (error) {
                console.error('Error rendering features:', error);
                // Fallback features if translation is missing
                const fallbackFeatures = [
                  {
                    title: "Experienced Teachers",
                    description: "Learn from experienced teachers with doctoral degrees"
                  },
                  {
                    title: "Small Classes",
                    description: "Special attention to each student with maximum 10 people per class"
                  },
                  {
                    title: "Online and In-person",
                    description: "Flexible learning options according to your needs"
                  },
                  {
                    title: "Comprehensive Consultation",
                    description: "Support with visa applications and university applications"
                  }
                ];
                
                return fallbackFeatures.map((feature, index) => (
                  <AnimatedSection key={index} animation="fade" direction="up" delay={index * 0.1}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </AnimatedSection>
                ));
              }
            })()}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-b from-primary via-[#590000] to-[#3D0000] text-white relative overflow-hidden" style={{ position: 'relative', isolation: 'isolate' }}>
        <div className="absolute inset-0 z-0">
          <NetworkBackground 
            particleColor="#ffffff" 
            lineColor="rgba(255, 255, 255, 0.3)" 
            particleNumber={120} 
            speed={0.8}
            interactive={true}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection animation="fade" direction="up">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white">{t('home.stats.title') || 'Our Impact by Numbers'}</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedStat endValue={1500} label={t('home.stats.students')} suffix="+" />
            <AnimatedStat endValue={10} label={t('home.stats.experience')} suffix="+" />
            <AnimatedStat endValue={25} label={t('home.stats.courses')} />
            <AnimatedStat endValue={98} label={t('home.stats.satisfaction')} suffix="%" />
          </div>
        </div>
      </section>
      
      {/* Featured Courses Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('home.featuredCourses.title')}</h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t('home.featuredCourses.subtitle')}</p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <AnimatedSection key={course.id} animation="fade" direction="up" delay={index * 0.1}>
                <CourseCard 
                  id={course.id}
                  title={t(course.titleKey)}
                  description={t(course.descriptionKey)}
                  level={t(course.levelKey)}
                  teacher={t(course.teacherKey)}
                  price={course.price}
                  imageUrl={course.imageUrl}
                  startDate={course.startDate}
                />
              </AnimatedSection>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-secondary transition-colors duration-300"
            >
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Level Determination Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade" direction="right">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <div className="relative h-96 bg-gradient-to-r from-primary to-[#750000] flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20">
                    <NetworkBackground 
                      particleColor="#ffffff" 
                      lineColor="rgba(255, 255, 255, 0.3)" 
                      particleNumber={80} 
                      speed={0.5}
                      interactive={false}
                    />
                  </div>
                  <div className="text-center text-white p-8 relative z-10">
                    <div className="text-6xl font-bold mb-4">A1-C2</div>
                    <div className="text-2xl">CEFR</div>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="border border-white/30 rounded-lg p-3">
                        <div className="text-3xl font-bold">A1</div>
                        <div className="text-sm opacity-80">Beginner</div>
                      </div>
                      <div className="border border-white/30 rounded-lg p-3">
                        <div className="text-3xl font-bold">B1</div>
                        <div className="text-sm opacity-80">Intermediate</div>
                      </div>
                      <div className="border border-white/30 rounded-lg p-3">
                        <div className="text-3xl font-bold">C1</div>
                        <div className="text-sm opacity-80">Advanced</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade" direction="left">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.levelDetermination.title')}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{t('home.levelDetermination.subtitle')}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{t('home.levelDetermination.description')}</p>
                
                <ul className="space-y-4 mb-8">
                  {(() => {
                    try {
                      const features = t.raw('home.levelDetermination.features');
                      if (Array.isArray(features)) {
                        return features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">{feature}</span>
                          </li>
                        ));
                      }
                      return null;
                    } catch (error) {
                      console.error('Error rendering level determination features:', error);
                      return null;
                    }
                  })()}
                </ul>
                
                <Link 
                  href={`/${locale}/consultation`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-secondary transition-colors duration-300"
                >
                  {t('home.levelDetermination.cta')}
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* Call to Action Banner */}
      <section className="py-12 bg-gradient-to-r from-primary via-[#660000] to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
            <p className="text-xl mb-8">{t('home.cta.subtitle')}</p>
            <Link 
              href={`/${locale}/consultation`}
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-primary bg-white hover:bg-gray-100 transition-colors duration-300"
            >
              {t('home.hero.buttons.consultation')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Latest Blog Posts */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('home.blog.title')}</h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t('home.blog.subtitle')}</p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentPosts.map((post) => (
              <DirectionAware 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
                key={post.id}
                swapMargin={true}
                swapPadding={true}
              >
                <div className="md:w-2/5 relative h-48 md:h-auto">
                  <PlaceholderImage
                    src={post.imageUrl}
                    alt={t(post.titleKey)}
                    fill
                    className="object-cover"
                    category={post.categoryKey.split('.').pop() || 'default'}
                  />
                </div>
                <div className="md:w-3/5 p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(post.titleKey)}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{t(post.summaryKey)}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('blog.author')}: {t(post.authorKey)}</span>
                    <Link
                      href={`/${locale}/blog/${post.id}`}
                      className="text-primary font-medium hover:text-primary-secondary"
                    >
                      {t('home.blog.readMore')}
                    </Link>
                  </div>
                </div>
              </DirectionAware>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href={`/${locale}/blog`}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              {t('home.blog.viewAll')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Contact Banner */}
      <section className="py-12 bg-gradient-to-r from-primary via-[#750000] to-[#600000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('home.contact.title')}</h2>
            <p className="text-xl mb-8">{t('home.contact.subtitle')}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-primary bg-white hover:bg-gray-100 transition-colors duration-300"
              >
                {t('home.contact.contactUs')}
              </Link>
              <Link 
                href={`/${locale}/consultation`}
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 transition-colors duration-300"
              >
                {t('home.contact.consultation')}
              </Link>
            </div>
        </div>
      </div>
      </section>
    </main>
  );
} 