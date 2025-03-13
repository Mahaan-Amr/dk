'use client';

import { useState, useEffect, useRef } from 'react';
import { CoursePreviewModal } from './course-preview-modal';
import { gsap } from 'gsap';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { PlaceholderImage } from './ui/placeholder-image';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  teacher: string;
  price: number;
  imageUrl: string;
  startDate: string;
}

export function CourseCard({ 
  id, 
  title, 
  description, 
  level, 
  teacher, 
  price, 
  imageUrl, 
  startDate 
}: CourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('courses');
  
  // Format price based on locale
  const formatPrice = () => {
    try {
      return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'de-DE').format(price);
    } catch {
      return price.toString();
    }
  };
  
  // Format date based on locale
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
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Simplified loading animation
  useEffect(() => {
    if (cardRef.current) {
      // Initial state
      gsap.set(cardRef.current, { 
        opacity: 0,
        y: 20
      });
      
      // Simple fade in animation
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power1.out',
        delay: 0.1 * Math.random(), // Slight random delay for natural staggering
      });
    }
  }, []);

  return (
    <>
      <div 
        ref={cardRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 cursor-pointer hover:shadow-lg"
        onClick={openModal}
      >
        <div className="relative">
          <div className="h-48 overflow-hidden">
            <PlaceholderImage
              src={imageUrl}
              alt={title}
              fill
              className="transition-transform duration-300 hover:scale-105"
              category={level.toLowerCase() || 'course'}
            />
          </div>
          <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 text-xs font-medium rounded">
            {level}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
          
          <div className="mt-auto">
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {teacher}
              </div>
              <div className="text-primary font-bold text-lg">
                {formatPrice()} 
                <span className="text-xs">
                  {locale === 'fa' ? 'تومان' : 'EUR'}
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{t('startDate')}: {formatDate(startDate)}</span>
              <span className="text-primary font-medium hover:text-primary-secondary">{t('details')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <CoursePreviewModal
          course={{
            id,
            title,
            description,
            level,
            teacher,
            price,
            imageUrl,
            startDate
          }}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
} 