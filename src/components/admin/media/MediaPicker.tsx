import { useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import MediaLibrary from './MediaLibrary';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  originalFilename: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  title: string;
  createdAt: string;
}

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label?: string;
  helpText?: string;
  required?: boolean;
  allowMultiple?: boolean;
  className?: string;
  previewSize?: 'small' | 'medium' | 'large';
}

export default function MediaPicker({
  value,
  onChange,
  placeholder = '',
  label = '',
  helpText = '',
  required = false,
  allowMultiple = false,
  className = '',
  previewSize = 'medium',
}: MediaPickerProps) {
  const t = useTranslations('admin.media');
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle media selection
  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    if (Array.isArray(media)) {
      // For multiple selection
      if (media.length > 0) {
        // Join URLs with commas or handle as needed
        onChange(media.map(item => item.url).join(','));
      }
    } else {
      // For single selection
      onChange(media.url);
    }
    setIsOpen(false);
  };
  
  // Size classes for preview
  const sizeClasses = {
    small: 'h-24',
    medium: 'h-40',
    large: 'h-60',
  };
  
  // Handle clear button click
  const handleClear = () => {
    onChange('');
  };
  
  // Check if there's an image to preview
  const hasPreview = !!value;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input and preview area */}
      <div className="flex flex-col space-y-2">
        {/* Text input */}
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Preview area */}
        {hasPreview && (
          <div className={`relative ${sizeClasses[previewSize]} w-full bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden`}>
            <Image
              src={value}
              alt=""
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white rounded-full"
              aria-label={t('clear')}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Help text */}
        {helpText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
      </div>
      
      {/* Media library modal */}
      {isOpen && (
        <MediaLibrary
          onSelect={handleMediaSelect}
          isModal={true}
          allowMultiple={allowMultiple}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 