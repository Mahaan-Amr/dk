import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Hook for fade-in animations
export const useFadeIn = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  delay: number = 0,
  duration: number = 0.8
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state based on direction
    let x = 0;
    let y = 0;
    
    switch (direction) {
      case 'up':
        y = 50;
        break;
      case 'down':
        y = -50;
        break;
      case 'left':
        x = 50;
        break;
      case 'right':
        x = -50;
        break;
    }

    // Create animation
    gsap.fromTo(
      element,
      {
        autoAlpha: 0,
        x,
        y,
      },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
        },
      }
    );

    // Cleanup
    return () => {
      const trigger = ScrollTrigger.getById(element.id);
      if (trigger) trigger.kill();
    };
  }, [direction, delay, duration]);

  return elementRef;
};

// Hook for staggered animations (for lists, grids, etc.)
export const useStaggerAnimation = (
  staggerDelay: number = 0.1,
  duration: number = 0.8
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.children;
    
    gsap.fromTo(
      elements,
      {
        autoAlpha: 0,
        y: 30,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration,
        stagger: staggerDelay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        },
      }
    );

    // Cleanup
    return () => {
      const trigger = ScrollTrigger.getById(container.id);
      if (trigger) trigger.kill();
    };
  }, [staggerDelay, duration]);

  return containerRef;
};

// Hook for parallax effect
export const useParallax = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Cleanup
    return () => {
      const trigger = ScrollTrigger.getById(element.id);
      if (trigger) trigger.kill();
    };
  }, [speed]);

  return elementRef;
};

// Function for text reveal animation
export const textRevealAnimation = (element: HTMLElement, delay: number = 0) => {
  return gsap.from(element, {
    duration: 1,
    opacity: 0,
    y: 20,
    delay,
    ease: 'power3.out',
  });
};

// Function for button hover animation
export const buttonHoverAnimation = (element: HTMLElement) => {
  element.addEventListener('mouseenter', () => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  });
}; 