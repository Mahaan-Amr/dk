'use client';

import { useEffect, useState, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Animation effect when button appears/disappears
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    if (isVisible) {
      gsap.fromTo(
        button,
        { opacity: 0, scale: 0.5 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.3, 
          ease: 'power2.out' 
        }
      );
    } else {
      gsap.to(button, { 
        opacity: 0, 
        scale: 0.5, 
        duration: 0.3, 
        ease: 'power2.in' 
      });
    }
  }, [isVisible]);

  // Add hover animation
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    button.addEventListener('mouseenter', () => {
      gsap.to(button, { 
        scale: 1.1, 
        duration: 0.2, 
        ease: 'power1.out' 
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, { 
        scale: 1, 
        duration: 0.2, 
        ease: 'power1.out' 
      });
    });

    return () => {
      button.removeEventListener('mouseenter', () => {});
      button.removeEventListener('mouseleave', () => {});
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      ref={buttonRef}
      onClick={scrollToTop}
      className={`fixed bottom-8 left-8 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-secondary transition-colors z-50 ${!isVisible ? 'pointer-events-none' : ''}`}
      aria-label="بازگشت به بالا"
      style={{ opacity: 0 }}
    >
      <FaArrowUp className="h-6 w-6" />
    </button>
  );
} 