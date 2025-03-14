'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PlaceholderImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  category?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function PlaceholderImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  containerClassName = '',
  category = 'default',
  priority = false,
  objectFit = 'cover'
}: PlaceholderImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Reset error state when src changes
    setError(false);
    setLoaded(false);
    
    // Preload image in memory to improve loading performance
    if (src && !priority) {
      const img = new globalThis.Image();
      img.src = src;
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
    }
  }, [src, priority]);

  // Generate a color based on the category/type
  const getPlaceholderColor = (category: string): string => {
    const colors: Record<string, string> = {
      // Blog categories
      'language': 'from-blue-500 to-blue-700',
      'immigration': 'from-purple-500 to-purple-700',
      'culture': 'from-green-500 to-green-700',
      'education': 'from-amber-500 to-amber-700',
      
      // Course levels
      'beginner': 'from-green-400 to-green-600',
      'intermediate': 'from-blue-400 to-blue-600',
      'advanced': 'from-red-400 to-red-600',
      
      // General categories
      'slider': 'from-gray-700 to-gray-900',
      'course': 'from-primary to-[#8A0000]',
      'teacher': 'from-indigo-500 to-indigo-700',
      'testimonial': 'from-amber-400 to-amber-600',
      
      // Default
      'default': 'from-primary to-primary-darker'
    };
    
    return colors[category.toLowerCase()] || colors.default;
  };
  
  // Generate placeholder when image fails to load or is loading
  const renderPlaceholder = () => {
    const gradientClass = getPlaceholderColor(category);
    
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradientClass} ${className}`}
        role="img"
        aria-label={alt}
        style={{ 
          width: fill ? '100%' : width ? `${width}px` : '100%',
          height: fill ? '100%' : height ? `${height}px` : '100%'
        }}
      >
        <div className="text-white text-center px-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-12 h-12 mx-auto mb-2 opacity-80"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
          <div className="font-medium text-sm md:text-base text-white/90 line-clamp-2">
            {alt || 'Image'}
          </div>
          {category !== 'default' && (
            <div className="text-xs mt-1 text-white/70 capitalize">
              {category}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Calculate appropriate sizes value based on container width
  const getSizesProp = () => {
    if (width && width > 0) {
      // If an exact width is specified, use it
      return `${width}px`;
    } else {
      // Otherwise use responsive sizes
      return '(max-width: 640px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 33vw';
    }
  };
  
  // If there's an error, only render the placeholder
  if (error) {
    return renderPlaceholder();
  }
  
  // Calculate container style
  const containerStyle = {
    width: fill ? '100%' : width ? `${width}px` : '100%',
    height: fill ? '100%' : height ? `${height}px` : '100%',
    position: 'relative' as const
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={containerStyle}
    >
      {/* Show placeholder while image is loading */}
      {!loaded && renderPlaceholder()}
      
      {/* Actual image with fade-in effect */}
      <div 
        className={`${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        aria-hidden={!loaded}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill={true}
            className={`${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''} ${className}`}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            sizes={getSizesProp()}
            quality={80}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width || 300}
            height={height || 200}
            className={`${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''} ${className}`}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            sizes={getSizesProp()}
            quality={80}
          />
        )}
      </div>
    </div>
  );
} 