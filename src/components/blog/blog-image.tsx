'use client';

import { useState } from 'react';

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
}

export function BlogImage({ src, alt, className = '', category = 'default' }: BlogImageProps) {
  const [error, setError] = useState(false);
  
  // Generate a color based on the category
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'language': 'from-blue-500 to-blue-700',
      'immigration': 'from-purple-500 to-purple-700',
      'culture': 'from-green-500 to-green-700',
      'education': 'from-amber-500 to-amber-700',
      'default': 'from-primary to-primary-darker'
    };
    
    return colors[category] || colors.default;
  };
  
  // Generate placeholder when image fails to load
  const renderPlaceholder = () => {
    const gradientClass = getCategoryColor(category);
    
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradientClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="text-white text-center px-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-12 h-12 mx-auto mb-4 opacity-80"
          >
            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
          <div className="font-medium text-lg text-white/90">
            {alt || 'Blog Image'}
          </div>
          <div className="text-sm mt-1 text-white/70">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        </div>
      </div>
    );
  };
  
  if (error) {
    return renderPlaceholder();
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        onError={() => setError(true)}
      />
    </div>
  );
} 