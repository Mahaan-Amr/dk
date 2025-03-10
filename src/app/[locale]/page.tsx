'use client';

import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { HeroCarousel } from '@/components/hero-carousel';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { AnimatedSection } from '@/components/animated-section';
import { AnimatedStat } from '@/components/animated-stat';
import { CourseCard } from '@/components/course-card';
import { DirectionAware } from '@/components/direction-aware';

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
    imageUrl: '/images/courses/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_style_1.jpg',
    startDate: '2024-04-01',
  },
  {
    id: '2',
    titleKey: 'courses.coursesList.b1.title',
    descriptionKey: 'courses.coursesList.b1.description',
    levelKey: 'courses.levels.intermediate',
    teacherKey: 'courses.teachers.rezaei',
    price: 3200000,
    imageUrl: '/images/courses/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_style_2.jpg',
    startDate: '2024-04-15',
  },
  {
    id: '3',
    titleKey: 'courses.coursesList.testdaf.title',
    descriptionKey: 'courses.coursesList.testdaf.description',
    levelKey: 'courses.levels.advanced',
    teacherKey: 'courses.teachers.alavi',
    price: 4500000,
    imageUrl: '/images/courses/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_featur_2.jpg',
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
    imageUrl: '/images/blog/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_style_1.jpg',
    date: '2024-03-01',
  },
  {
    id: '2',
    titleKey: 'blog.posts.post2.title',
    summaryKey: 'blog.posts.post2.summary',
    authorKey: 'blog.authors.author2',
    imageUrl: '/images/blog/Leonardo_Phoenix_10_Highcontrast_minimalist_photography_style_2.jpg',
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
            {t.raw('home.whyUs.features').map((feature: Feature, index: number) => (
              <AnimatedSection key={index} animation="fade" direction="up" delay={index * 0.1}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-b from-primary via-[#590000] to-[#3D0000] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
                swapMargin={true}
                swapPadding={true}
              >
                <div className="md:w-2/5">
                  <div 
                    className="h-48 md:h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.imageUrl})` }}
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