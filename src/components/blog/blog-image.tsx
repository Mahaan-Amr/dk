'use client';

import { useState } from 'react';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import Image from 'next/image';

// Props for BlogImage component
interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Blog image component with error handling and placeholder
 */
export function BlogImage({ 
  src, 
  alt, 
  className = '', 
  width = 800,
  height = 450
}: BlogImageProps) {
  const [error, setError] = useState(false);
  
  // If image fails to load or no src provided, show placeholder
  if (error || !src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <PlaceholderImage 
          src="" 
          alt={alt}
          width={width}
          height={height}
          category="blog"
        />
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        onError={() => setError(true)}
      />
    </div>
  );
} 