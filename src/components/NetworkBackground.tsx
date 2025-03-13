'use client';

import { useCallback } from 'react';
import { Particles } from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

interface NetworkBackgroundProps {
  className?: string;
  particleColor?: string;
  backgroundColor?: string;
  lineColor?: string;
  particleNumber?: number;
  speed?: number;
  interactive?: boolean;
}

const NetworkBackground = ({
  className = '',
  particleColor = '#ffffff',
  backgroundColor = 'transparent',
  lineColor = '#ffffff',
  particleNumber = 80,
  speed = 1,
  interactive = true,
}: NetworkBackgroundProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      className={`absolute inset-0 z-0 ${className}`}
      init={particlesInit}
      options={{
        fullScreen: {
          enable: false
        },
        background: {
          color: {
            value: backgroundColor,
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: interactive,
              mode: "push",
            },
            onHover: {
              enable: interactive,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: particleColor,
          },
          links: {
            color: lineColor,
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          collisions: {
            enable: false,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: speed,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: particleNumber,
          },
          opacity: {
            value: 0.5,
            random: true,
            anim: {
              enable: true,
              speed: 0.5,
              opacity_min: 0.1,
              sync: false,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 5 },
            random: true,
            anim: {
              enable: true,
              speed: 1,
              size_min: 0.1,
              sync: false,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default NetworkBackground; 