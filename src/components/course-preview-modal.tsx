'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FaTimes,
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

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    teacher: string;
    price: number;
    imageUrl: string;
    startDate: string;
  };
}

export function CoursePreviewModal({ isOpen, onClose, course }: CoursePreviewModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fa-IR');
  };

  useEffect(() => {
    setShareUrl(`${window.location.origin}/courses/${course.id}`);
  }, [course.id]);

  const shareButtons = [
    {
      icon: FaWhatsapp,
      label: 'واتساپ',
      onClick: () => shareUrl && window.open(`https://wa.me/?text=${encodeURIComponent(`${course.title}\n${shareUrl}`)}`, '_blank'),
      color: 'bg-green-500'
    },
    {
      icon: FaTelegram,
      label: 'تلگرام',
      onClick: () => shareUrl && window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(course.title)}`, '_blank'),
      color: 'bg-blue-500'
    },
    {
      icon: FaTwitter,
      label: 'توییتر',
      onClick: () => shareUrl && window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${course.title}\n${shareUrl}`)}`, '_blank'),
      color: 'bg-sky-500'
    },
    {
      icon: FaLink,
      label: 'کپی لینک',
      onClick: () => {
        if (shareUrl) {
          navigator.clipboard.writeText(shareUrl);
          alert('لینک کپی شد!');
        }
      },
      color: 'bg-gray-500'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'معرفی دوره', icon: FaBook },
    { id: 'syllabus', label: 'سرفصل‌ها', icon: FaListUl },
    { id: 'objectives', label: 'اهداف دوره', icon: FaCheckCircle }
  ];

  const courseObjectives = [
    'یادگیری مکالمه روزمره به زبان آلمانی',
    'تسلط بر گرامر پایه زبان آلمانی',
    'آمادگی برای آزمون‌های بین‌المللی',
    'توانایی خواندن و درک متون ساده'
  ];

  const courseSyllabus = [
    {
      title: 'معرفی و آشنایی با زبان آلمانی',
      duration: '۴ جلسه',
      topics: ['الفبای آلمانی', 'تلفظ صحیح', 'اعداد و شمارش', 'احوالپرسی']
    },
    {
      title: 'گرامر پایه',
      duration: '۸ جلسه',
      topics: ['افعال پایه', 'ضمایر شخصی', 'حروف اضافه', 'زمان حال ساده']
    },
    {
      title: 'مکالمه روزمره',
      duration: '۶ جلسه',
      topics: ['معرفی خود', 'خرید کردن', 'جهت‌یابی', 'سفارش غذا']
    },
    {
      title: 'تمرین و مرور',
      duration: '۶ جلسه',
      topics: ['تمرین‌های گرامری', 'مکالمه دو نفره', 'تمرین شنیداری', 'آزمون‌های تمرینی']
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
                <motion.button
                  className="text-white hover:text-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  {isBookmarked ? (
                    <FaBookmark className="w-6 h-6" />
                  ) : (
                    <FaRegBookmark className="w-6 h-6" />
                  )}
                </motion.button>
                <motion.button
                  className="text-white hover:text-gray-200 transition-colors relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowShareOptions(!showShareOptions)}
                >
                  <FaShare className="w-6 h-6" />
                  <AnimatePresence>
                    {showShareOptions && (
                      <motion.div
                        className="absolute left-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 flex flex-col gap-2 min-w-[150px]"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {shareButtons.map((button, index) => (
                          <motion.button
                            key={index}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-white ${button.color}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              button.onClick();
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <button.icon className="w-4 h-4" />
                            <span className="text-sm">{button.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button
                  className="text-white hover:text-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                >
                  <FaTimes className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Course Image */}
              <div className="relative h-64">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.title}
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaUser className="w-5 h-5 ml-2" />
                    <span>مدرس: {course.teacher}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaGraduationCap className="w-5 h-5 ml-2" />
                    <span>سطح: {course.level}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCalendar className="w-5 h-5 ml-2" />
                    <span>شروع: {formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaClock className="w-5 h-5 ml-2" />
                    <span>۲۴ جلسه</span>
                  </div>
                </div>

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
                <div className="mb-6">
                  {activeTab === 'overview' && (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-600 dark:text-gray-300">
                        {course.description}
                      </p>
                    </div>
                  )}

                  {activeTab === 'syllabus' && (
                    <div className="space-y-4">
                      {courseSyllabus.map((section, index) => (
                        <div
                          key={index}
                          className="border dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {section.duration}
                            </span>
                          </div>
                          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                            {section.topics.map((topic, topicIndex) => (
                              <li key={topicIndex}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'objectives' && (
                    <div className="space-y-3">
                      {courseObjectives.map((objective, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                        >
                          <FaCheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>{objective}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(course.price)} تومان
                    </span>
                    <button
                      className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-secondary transition-colors"
                      onClick={() => {/* Handle enrollment */}}
                    >
                      ثبت‌نام در دوره
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 