'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      icon: FaWhatsapp,
      label: 'واتساپ',
      href: 'https://wa.me/+989123456789',
      color: 'bg-green-500',
    },
    {
      icon: FaPhone,
      label: 'تماس',
      href: 'tel:+989123456789',
      color: 'bg-blue-500',
    },
    {
      icon: FaEnvelope,
      label: 'ایمیل',
      href: 'mailto:info@derakhtekheradd.com',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 mb-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-4">
              {contactOptions.map((option, index) => (
                <motion.a
                  key={option.label}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 space-x-reverse ${option.color} text-white px-4 py-2 rounded-full shadow-lg hover:opacity-90 transition-opacity`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <option.icon className="w-5 h-5" />
                  <span>{option.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`p-4 rounded-full shadow-lg text-white ${
          isOpen ? 'bg-gray-600' : 'bg-primary'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaComments className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
} 