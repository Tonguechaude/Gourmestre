import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let breakpoint: Breakpoint;
      
      if (width < 768) {
        breakpoint = 'mobile';
      } else if (width < 1024) {
        breakpoint = 'tablet';
      } else {
        breakpoint = 'desktop';
      }

      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
      });
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
};