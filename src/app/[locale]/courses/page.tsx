'use client';

import { useState } from 'react';
import { StickyHeader } from '@/components/sticky-header';
import { BackToTop } from '@/components/back-to-top';
import { FloatingChat } from '@/components/floating-chat';
import { CourseCard } from '@/components/course-card';
import { useTranslations } from 'next-intl';

// Sample courses data (in a real app, this would come from an API)
const allCourses = [
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
  // Add more courses...
];

export default function CoursesPage() {
  const t = useTranslations();

  // Get localized level and teacher values
  const levels = [
    'courses.filter.all', 
    'courses.levels.beginner', 
    'courses.levels.intermediate', 
    'courses.levels.advanced'
  ];
  
  const teachers = [
    'courses.filter.all', 
    'courses.teachers.mohammadi', 
    'courses.teachers.rezaei', 
    'courses.teachers.alavi'
  ];

  const [selectedLevel, setSelectedLevel] = useState(levels[0]);
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = allCourses.filter((course) => {
    const matchesLevel = selectedLevel === 'courses.filter.all' || course.levelKey === selectedLevel;
    const matchesTeacher = selectedTeacher === 'courses.filter.all' || course.teacherKey === selectedTeacher;
    const matchesSearch = t(course.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t(course.descriptionKey).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesTeacher && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <BackToTop />
      <FloatingChat />
      
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {t('courses.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('courses.search')}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {levels.map((levelKey) => (
              <option key={levelKey} value={levelKey}>
                {t(levelKey)}
              </option>
            ))}
          </select>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {teachers.map((teacherKey) => (
              <option key={teacherKey} value={teacherKey}>
                {t(teacherKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Course Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id}
              id={course.id}
              title={t(course.titleKey)}
              description={t(course.descriptionKey)}
              level={t(course.levelKey)}
              teacher={t(course.teacherKey)}
              price={course.price}
              imageUrl={course.imageUrl}
              startDate={course.startDate}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('courses.noCoursesFound')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 