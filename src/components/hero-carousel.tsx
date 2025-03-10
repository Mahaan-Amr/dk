'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

export function HeroCarousel() {
  const t = useTranslations('home.hero');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const locale = useLocale();

  // Get slides from translations
  const slides = [0, 1, 2].map(index => ({
    id: index + 1,
    image: '/placeholder-hero.jpg',
    title: t(`slides.${index}.title`),
    subtitle: t(`slides.${index}.subtitle`),
    description: t(`slides.${index}.description`),
  }));

  const animateSlide = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const direction = newIndex > currentSlide ? 1 : -1;
    const currentSlideEl = slideRefs.current[currentSlide];
    const nextSlideEl = slideRefs.current[newIndex];

    if (!currentSlideEl || !nextSlideEl) {
      setIsAnimating(false);
      return;
    }

    // Create a timeline for coordinated animations
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSlide(newIndex);
        setIsAnimating(false);
      }
    });

    // Smooth fade out for the current slide
    tl.to(currentSlideEl, {
      xPercent: -100 * direction,
      opacity: 0,
      zIndex: 0,
      duration: 0.9,
      ease: 'power3.inOut'
    }, 0);

    // Prepare next slide
    gsap.set(nextSlideEl, { 
      xPercent: 100 * direction, 
      opacity: 0,
      zIndex: 0
    });

    // Smooth fade in for the next slide
    tl.to(nextSlideEl, {
      xPercent: 0,
      opacity: 1,
      zIndex: 1,
      duration: 0.9,
      ease: 'power3.inOut'
    }, 0.1); // Slight delay for better overlap

    // Get slide content elements
    const title = nextSlideEl.querySelector('.slide-title');
    const subtitle = nextSlideEl.querySelector('.slide-subtitle');
    const description = nextSlideEl.querySelector('.slide-description');
    const buttons = nextSlideEl.querySelector('.slide-buttons');

    // Add content animations to the timeline for coordinated timing
    tl.fromTo(
      [title, subtitle, description, buttons],
      { 
        y: 30, 
        opacity: 0,
        filter: 'blur(8px)'
      },
      { 
        y: 0, 
        opacity: 1, 
        filter: 'blur(0px)',
        duration: 0.7, 
        stagger: 0.12,
        ease: 'power2.out'
      },
      0.4 // Start content animations after slide transition begins
    );

  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const newIndex = (currentSlide + 1) % slides.length;
    animateSlide(newIndex);
  }, [currentSlide, animateSlide, slides.length]);

  const prevSlide = useCallback(() => {
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    animateSlide(newIndex);
  }, [currentSlide, animateSlide, slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide) return;
    animateSlide(index);
  }, [currentSlide, animateSlide]);

  // Initialize the carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Set up initial positions
    gsap.set(slideRefs.current, { 
      xPercent: (i) => i * 100,
      opacity: (i) => i === 0 ? 1 : 0,
      zIndex: (i) => i === 0 ? 1 : 0
    });

    // Auto-advance slides
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnimating, nextSlide]);

  return (
    <div 
      className="relative h-[600px] overflow-hidden" 
      ref={carouselRef}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          ref={(el) => {
            slideRefs.current[index] = el;
          }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
          <div className="relative h-full flex items-center justify-center text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="slide-title text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                {slide.title}
                <span className="slide-subtitle block text-primary">{slide.subtitle}</span>
              </h2>
              <p className="slide-description mt-4 text-xl text-gray-100">
                {slide.description}
              </p>
              <div className="slide-buttons mt-8 flex justify-center space-x-4 space-x-reverse">
                <Link
                  href={`/${locale}/courses`}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-secondary md:py-4 md:text-lg md:px-10"
                >
                  {t('buttons.courses')}
                </Link>
                <Link
                  href={`/${locale}/consultation`}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  {t('buttons.consultation')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-secondary transition-all z-20"
        onClick={prevSlide}
        disabled={isAnimating}
        aria-label="Previous slide"
      >
        <FaChevronLeft className="h-6 w-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-secondary transition-all z-20"
        onClick={nextSlide}
        disabled={isAnimating}
        aria-label="Next slide"
      >
        <FaChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`group relative transition-all ${
              index === currentSlide ? 'scale-100' : 'scale-90 opacity-70'
            }`}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span 
              className={`block w-10 h-3 rounded-full transition-all transform ${
                index === currentSlide ? 'bg-primary shadow-lg scale-100' : 'bg-white scale-90'
              } group-hover:scale-100 group-hover:opacity-100`} 
            />
            {/* Slide Preview on Hover */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="rounded overflow-hidden shadow-lg">
                <Image 
                  src={slides[index].image} 
                  alt={slides[index].title} 
                  width={128}
                  height={80}
                  className="w-full h-20 object-cover"
                />
                <div className="bg-primary text-white text-xs py-1 px-2 text-center">
                  {slides[index].title}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 