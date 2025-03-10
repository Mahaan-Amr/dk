'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Define types for GSAP variables
interface GSAPVars {
  [key: string]: unknown;
  duration?: number;
  ease?: string;
  clearProps?: string;
  stagger?: number;
  opacity?: number;
  y?: number | string;
  x?: number | string;
  scale?: number;
  clipPath?: string;
  delay?: number;
}

type AnimationType = 'fade' | 'slide' | 'zoom' | 'reveal' | 'stagger' | 'parallax';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  staggerChildren?: boolean;
  staggerAmount?: number;
  threshold?: number;
  parallaxAmount?: number;
}

export function AnimatedSection({ 
  children, 
  className = '',
  animation = 'fade',
  direction = 'up',
  delay = 0,
  duration = 0.8,
  staggerChildren = false,
  staggerAmount = 0.1,
  threshold = 0.3,
  parallaxAmount = 0.2
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const childrenElements = childrenRef.current;
    
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      let fromVars: GSAPVars = {};
      let toVars: GSAPVars = {
        duration: duration,
        ease: 'power2.out',
        clearProps: 'all',
        stagger: staggerChildren ? staggerAmount : 0,
      };

      // Set the initial and target animation states based on the animation type
      switch (animation) {
        case 'fade':
          fromVars = { opacity: 0 };
          toVars = { ...toVars, opacity: 1 };
          
          // Add directional movement if specified
          if (direction === 'up') fromVars = { ...fromVars, y: 50 };
          if (direction === 'down') fromVars = { ...fromVars, y: -50 };
          if (direction === 'left') fromVars = { ...fromVars, x: 50 };
          if (direction === 'right') fromVars = { ...fromVars, x: -50 };
          
          if (direction === 'up') toVars = { ...toVars, y: 0 };
          if (direction === 'down') toVars = { ...toVars, y: 0 };
          if (direction === 'left') toVars = { ...toVars, x: 0 };
          if (direction === 'right') toVars = { ...toVars, x: 0 };
          break;
          
        case 'slide':
          if (direction === 'up') fromVars = { y: '100%' };
          if (direction === 'down') fromVars = { y: '-100%' };
          if (direction === 'left') fromVars = { x: '100%' };
          if (direction === 'right') fromVars = { x: '-100%' };
          
          if (direction === 'up') toVars = { ...toVars, y: '0%' };
          if (direction === 'down') toVars = { ...toVars, y: '0%' };
          if (direction === 'left') toVars = { ...toVars, x: '0%' };
          if (direction === 'right') toVars = { ...toVars, x: '0%' };
          break;
          
        case 'zoom':
          fromVars = { scale: 0.5, opacity: 0 };
          toVars = { ...toVars, scale: 1, opacity: 1 };
          break;
          
        case 'reveal':
          // Create a mask effect
          gsap.set(content, { clipPath: 'inset(0 100% 0 0)' });
          toVars = { ...toVars, clipPath: 'inset(0 0% 0 0)' };
          break;
          
        case 'stagger':
          if (childrenElements && childrenElements.children.length) {
            fromVars = { y: 30, opacity: 0 };
            toVars = { ...toVars, y: 0, opacity: 1 };
            
            // Set trigger for staggered children
            ScrollTrigger.create({
              trigger: section,
              start: `top ${100 - threshold * 100}%`,
              toggleActions: 'play none none none',
              onEnter: () => {
                gsap.fromTo(
                  childrenElements.children,
                  fromVars,
                  { ...toVars, delay: delay }
                );
              }
            });
            return;
          }
          break;
          
        case 'parallax':
          // Create parallax effect
          ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              gsap.to(content, {
                y: (self.progress * 100 * parallaxAmount) * -1,
                ease: 'none',
                overwrite: 'auto'
              });
            }
          });
          return;  // Skip standard animation for parallax
      }
      
      // Default ScrollTrigger for non-parallax animations
      const excludedAnimations: AnimationType[] = ['parallax', 'stagger'];
      if (!excludedAnimations.includes(animation)) {
        ScrollTrigger.create({
          trigger: section,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: 'play none none none',
          onEnter: () => {
            gsap.fromTo(
              content,
              fromVars,
              { ...toVars, delay: delay }
            );
          }
        });
      }
    }, section);
    
    return () => ctx.revert();
  }, [animation, direction, duration, delay, staggerChildren, staggerAmount, threshold, parallaxAmount]);

  return (
    <div ref={sectionRef} className={className}>
      <div ref={contentRef} style={{ opacity: animation === 'fade' ? 0 : 1 }}>
        {staggerChildren ? (
          <div ref={childrenRef}>
            {children}
          </div>
        ) : children}
      </div>
    </div>
  );
} 