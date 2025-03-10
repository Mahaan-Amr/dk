'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

interface AnimatedStatProps {
  endValue: number;
  label: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedStat({ endValue, label, suffix = '', duration = 2 }: AnimatedStatProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const countRef = useRef({ value: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a ScrollTrigger for the animation
    const ctx = gsap.context(() => {
      // Animate the container
      gsap.fromTo(
        container,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            once: true,
          },
        }
      );

      // Animate the counter
      gsap.to(countRef.current, {
        value: endValue,
        duration: duration,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
        onUpdate: () => {
          setCount(Math.floor(countRef.current.value));
        },
      });
    }, container);

    return () => ctx.revert(); // Cleanup
  }, [endValue, duration]);

  return (
    <div
      ref={containerRef}
      className="text-center"
    >
      <div className="text-4xl font-bold text-white">
        {count}
        {suffix}
      </div>
      <div className="mt-2 text-xl text-white">{label}</div>
    </div>
  );
} 