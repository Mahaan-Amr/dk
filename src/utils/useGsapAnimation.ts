import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type AnimationOptions = {
  duration?: number;
  delay?: number;
  ease?: string;
  scrollTrigger?: boolean;
  scrollTriggerOptions?: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    once?: boolean;
  };
};

// Define types for GSAP animation variables
interface GSAPFromVars {
  opacity?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
  [key: string]: unknown;
}

interface ScrollTriggerConfig {
  trigger: Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  once?: boolean;
  [key: string]: unknown;
}

interface GSAPToVars {
  duration: number;
  delay: number;
  ease: string;
  opacity?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotation?: number;
  scrollTrigger?: ScrollTriggerConfig;
  [key: string]: unknown;
}

export const useGsapAnimation = <T extends HTMLElement>(
  animation: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scale' | 'rotate',
  options: AnimationOptions = {}
) => {
  const elementRef = useRef<T>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const {
      duration = 0.8,
      delay = 0,
      ease = 'power2.out',
      scrollTrigger = true,
      scrollTriggerOptions = {
        start: 'top 80%',
        once: true
      }
    } = options;
    
    let fromVars: GSAPFromVars = {};
    let toVars: GSAPToVars = {
      duration,
      delay,
      ease
    };
    
    // Set animation variables based on animation type
    switch (animation) {
      case 'fadeIn':
        fromVars = { opacity: 0 };
        toVars = { ...toVars, opacity: 1 };
        break;
      case 'fadeInUp':
        fromVars = { opacity: 0, y: 50 };
        toVars = { ...toVars, opacity: 1, y: 0 };
        break;
      case 'fadeInDown':
        fromVars = { opacity: 0, y: -50 };
        toVars = { ...toVars, opacity: 1, y: 0 };
        break;
      case 'fadeInLeft':
        fromVars = { opacity: 0, x: -50 };
        toVars = { ...toVars, opacity: 1, x: 0 };
        break;
      case 'fadeInRight':
        fromVars = { opacity: 0, x: 50 };
        toVars = { ...toVars, opacity: 1, x: 0 };
        break;
      case 'scale':
        fromVars = { opacity: 0, scale: 0.5 };
        toVars = { ...toVars, opacity: 1, scale: 1 };
        break;
      case 'rotate':
        fromVars = { opacity: 0, rotation: -10 };
        toVars = { ...toVars, opacity: 1, rotation: 0 };
        break;
      default:
        fromVars = { opacity: 0 };
        toVars = { ...toVars, opacity: 1 };
    }
    
    // Add ScrollTrigger if enabled
    if (scrollTrigger) {
      toVars = {
        ...toVars,
        scrollTrigger: {
          trigger: element,
          ...scrollTriggerOptions
        }
      };
    }
    
    // Create animation
    const ctx = gsap.context(() => {
      gsap.fromTo(element, fromVars, toVars);
    });
    
    // Cleanup
    return () => {
      ctx.revert();
    };
  }, [animation, options]);
  
  return elementRef;
}; 