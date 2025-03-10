'use client';

import { useState, useEffect } from 'react';
import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  FaCalendar,
  FaUser,
  FaGraduationCap,
  FaClock,
  FaBook,
  FaCheckCircle,
  FaListUl,
  FaRegBookmark,
  FaBookmark,
  FaShare,
  FaWhatsapp,
  FaTelegram,
  FaTwitter,
  FaLink
} from 'react-icons/fa';
import Link from 'next/link';

// Sample courses data (in a real app, this would come from an API)
const allCourses = [
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

interface Course {
  id: string;
  titleKey: string;
  descriptionKey: string;
  levelKey: string;
  teacherKey: string;
  price: number;
  imageUrl: string;
  startDate: string;
}

export default function CourseDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch data from API
    // For now, we use the mock data
    const foundCourse = allCourses.find(c => c.id === courseId);
    
    if (foundCourse) {
      setCourse(foundCourse);
    }
    setLoading(false);
  }, [courseId]);

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'de-DE').format(price);
    } catch {
      return price.toString();
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareButtons = [
    {
      icon: FaWhatsapp,
      label: t('common.share.whatsapp'),
      onClick: () => shareUrl && window.open(`https://wa.me/?text=${encodeURIComponent(`${t(course?.titleKey)}\n${shareUrl}`)}`, '_blank'),
      color: 'bg-green-500'
    },
    {
      icon: FaTelegram,
      label: t('common.share.telegram'),
      onClick: () => shareUrl && window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(t(course?.titleKey))}`, '_blank'),
      color: 'bg-blue-500'
    },
    {
      icon: FaTwitter,
      label: t('common.share.twitter'),
      onClick: () => shareUrl && window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${t(course?.titleKey)}\n${shareUrl}`)}`, '_blank'),
      color: 'bg-sky-500'
    },
    {
      icon: FaLink,
      label: t('common.share.copyLink'),
      onClick: () => {
        if (shareUrl) {
          navigator.clipboard.writeText(shareUrl);
          alert(t('common.share.copied'));
        }
      },
      color: 'bg-gray-500'
    }
  ];

  const tabs = [
    { id: 'overview', label: t('courses.detail.tabs.overview'), icon: FaBook },
    { id: 'syllabus', label: t('courses.detail.tabs.syllabus'), icon: FaListUl },
    { id: 'objectives', label: t('courses.detail.tabs.objectives'), icon: FaCheckCircle }
  ];

  // Sample course objectives
  const courseObjectives = [
    t('courses.detail.objectives.item1'),
    t('courses.detail.objectives.item2'),
    t('courses.detail.objectives.item3'),
    t('courses.detail.objectives.item4')
  ];

  // Sample syllabus data
  const courseSyllabus = [
    {
      title: t('courses.detail.syllabus.section1.title'),
      duration: t('courses.detail.syllabus.section1.duration'),
      topics: [
        t('courses.detail.syllabus.section1.topic1'),
        t('courses.detail.syllabus.section1.topic2'),
        t('courses.detail.syllabus.section1.topic3'),
        t('courses.detail.syllabus.section1.topic4')
      ]
    },
    {
      title: t('courses.detail.syllabus.section2.title'),
      duration: t('courses.detail.syllabus.section2.duration'),
      topics: [
        t('courses.detail.syllabus.section2.topic1'),
        t('courses.detail.syllabus.section2.topic2'),
        t('courses.detail.syllabus.section2.topic3'),
        t('courses.detail.syllabus.section2.topic4')
      ]
    },
    {
      title: t('courses.detail.syllabus.section3.title'),
      duration: t('courses.detail.syllabus.section3.duration'),
      topics: [
        t('courses.detail.syllabus.section3.topic1'),
        t('courses.detail.syllabus.section3.topic2'),
        t('courses.detail.syllabus.section3.topic3'),
        t('courses.detail.syllabus.section3.topic4')
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <StickyHeader />
        <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('courses.detail.courseNotFound')}
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {t('courses.detail.courseNotFoundDesc')}
          </p>
          <Link 
            href={`/${locale}/courses`}
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition duration-300"
          >
            {t('courses.detail.backToCourses')}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingChat />
      
      <main className="pb-16">
        {/* Course Header */}
        <div className="relative h-96">
          <img
            src={course.imageUrl}
            alt={t(course.titleKey)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {t(course.titleKey)}
              </h1>
              
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <FaUser className="w-5 h-5 mr-2" />
                  <span>{t(course.teacherKey)}</span>
                </div>
                <div className="flex items-center">
                  <FaGraduationCap className="w-5 h-5 mr-2" />
                  <span>{t(course.levelKey)}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="w-5 h-5 mr-2" />
                  <span>{formatDate(course.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="w-5 h-5 mr-2" />
                  <span>24 {t('courses.detail.sessions')}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="bg-primary hover:bg-primary-dark transition duration-300 text-white py-2 px-6 rounded-md"
                >
                  {t('courses.detail.enroll')}
                </button>
                <div className="flex items-center gap-4">
                  <button
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    {isBookmarked ? (
                      <FaBookmark className="w-6 h-6" />
                    ) : (
                      <FaRegBookmark className="w-6 h-6" />
                    )}
                  </button>
                  <div className="relative">
                    <button
                      className="text-white hover:text-gray-200 transition-colors"
                      onClick={() => setShowShareOptions(!showShareOptions)}
                    >
                      <FaShare className="w-6 h-6" />
                    </button>
                    {showShareOptions && (
                      <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 flex flex-col gap-2 min-w-[150px]">
                        {shareButtons.map((button, index) => (
                          <button
                            key={index}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-white ${button.color}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              button.onClick();
                            }}
                          >
                            <button.icon className="w-4 h-4" />
                            <span className="text-sm">{button.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-auto text-2xl font-bold">
                  {formatPrice(course.price)} 
                  <span className="text-sm ml-1">
                    {locale === 'fa' ? t('courses.detail.currency.toman') : t('courses.detail.currency.euro')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b dark:border-gray-700 mb-6">
            <div className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t(course.descriptionKey)}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('courses.detail.overviewDescription')}
                </p>
              </div>
            )}
            
            {activeTab === 'syllabus' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('courses.detail.syllabusTitle')}
                </h3>
                <div className="space-y-6">
                  {courseSyllabus.map((section, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {section.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.duration}
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                        {section.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'objectives' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('courses.detail.objectivesTitle')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t('courses.detail.objectivesDescription')}
                </p>
                <ul className="space-y-2">
                  {courseObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Enrollment CTA */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('courses.detail.ctaTitle')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {t('courses.detail.ctaDescription')}
              </p>
            </div>
            <button
              className="mt-4 md:mt-0 bg-primary hover:bg-primary-dark transition duration-300 text-white py-2 px-6 rounded-md"
            >
              {t('courses.detail.enroll')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 