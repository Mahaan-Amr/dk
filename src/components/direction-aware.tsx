'use client';

import { useLocale } from 'next-intl';
import { ReactNode, createElement, ElementType } from 'react';
import clsx from 'clsx';

interface DirectionAwareProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  swapMargin?: boolean;
  swapPadding?: boolean;
  swapText?: boolean;
  swapFlex?: boolean;
  swapBorder?: boolean;
  swapRounded?: boolean;
}

/**
 * A utility component that adjusts its children's styles based on the current locale direction (RTL/LTR)
 * This helps with proper spacing, layout, and text alignment in multi-directional designs.
 */
export function DirectionAware({
  children,
  className = '',
  as = 'div',
  swapMargin = false,
  swapPadding = false,
  swapText = false,
  swapFlex = false,
  swapBorder = false,
  swapRounded = false,
}: DirectionAwareProps) {
  const locale = useLocale();
  const isRTL = locale === 'fa';

  // Function to swap left/right classes
  const swapDirection = (classes: string) => {
    // Don't modify if no swapping is requested
    if (!swapMargin && !swapPadding && !swapText && !swapFlex && !swapBorder && !swapRounded) {
      return classes;
    }

    return classes
      .split(' ')
      .map(cls => {
        // Check which property types to swap
        if (swapMargin && (cls.startsWith('mr-') || cls.startsWith('ml-') || 
                        cls.startsWith('-mr-') || cls.startsWith('-ml-'))) {
          return cls.replace(/m([lr])-/, (_, dir) => `m${dir === 'l' ? 'r' : 'l'}-`)
                   .replace(/-m([lr])-/, (_, dir) => `-m${dir === 'l' ? 'r' : 'l'}-`);
        }
        
        if (swapPadding && (cls.startsWith('pr-') || cls.startsWith('pl-'))) {
          return cls.replace(/p([lr])-/, (_, dir) => `p${dir === 'l' ? 'r' : 'l'}-`);
        }
        
        if (swapText && (cls === 'text-left' || cls === 'text-right')) {
          return cls === 'text-left' ? 'text-right' : 'text-left';
        }
        
        if (swapFlex && (cls === 'justify-start' || cls === 'justify-end' || 
                      cls === 'items-start' || cls === 'items-end')) {
          return cls.replace(/(justify|items)-(start|end)/, (_, prop, pos) => 
            `${prop}-${pos === 'start' ? 'end' : 'start'}`);
        }
        
        if (swapBorder && (cls.startsWith('border-l-') || cls.startsWith('border-r-'))) {
          return cls.replace(/border-([lr])-/, (_, dir) => `border-${dir === 'l' ? 'r' : 'l'}-`);
        }
        
        if (swapRounded && (
            cls.startsWith('rounded-tl-') || cls.startsWith('rounded-tr-') ||
            cls.startsWith('rounded-bl-') || cls.startsWith('rounded-br-')
        )) {
          return cls.replace(/rounded-([tb])([lr])-/, (_, tb, lr) => 
            `rounded-${tb}${lr === 'l' ? 'r' : 'l'}-`);
        }
        
        return cls;
      })
      .join(' ');
  };

  // Apply direction-specific styling
  const directionAwareClass = isRTL 
    ? swapDirection(className)
    : className;

  return createElement(
    as,
    { className: clsx(directionAwareClass) },
    children
  );
} 