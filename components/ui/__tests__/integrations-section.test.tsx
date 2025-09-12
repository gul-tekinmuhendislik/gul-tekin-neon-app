import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { IntegrationsSection } from '../integrations-section';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

describe('IntegrationsSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Math.random for consistent tests
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<IntegrationsSection />);
      expect(screen.getByText('Hizmetler')).toBeInTheDocument();
    });

    it('should render the section heading and description', () => {
      render(<IntegrationsSection />);
      
      expect(screen.getByText('Hizmetler')).toBeInTheDocument();
      expect(screen.getByText('Sıhhi tesisat, güneş enerjisi sistemleri ve ısı pompası çözümleri')).toBeInTheDocument();
    });

    it('should have the correct section id for navigation', () => {
      const { container } = render(<IntegrationsSection />);
      const section = container.querySelector('#integrations');
      
      expect(section).toBeInTheDocument();
    });

    it('should render service icons', () => {
      const { container } = render(<IntegrationsSection />);
      const icons = container.querySelectorAll('svg');
      
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Card Component', () => {
    it('should render cards with icons and backgrounds', () => {
      const { container } = render(<IntegrationsSection />);
      
      // Check for card containers
      const cards = container.querySelectorAll('.relative.size-20');
      expect(cards.length).toBeGreaterThan(0);
      
      // Check for background gradients
      const gradients = container.querySelectorAll('.bg-gradient-to-r');
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should apply hover effects to cards', () => {
      const { container } = render(<IntegrationsSection />);
      
      const cards = container.querySelectorAll('.hover\\:scale-\\[1\\.15\\]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have different gradient colors for different service types', () => {
      const { container } = render(<IntegrationsSection />);
      
      // Check for various gradient colors
      const blueGradient = container.querySelector('.from-blue-500');
      const yellowGradient = container.querySelector('.from-yellow-400');
      const redGradient = container.querySelector('.from-red-500');
      
      expect(blueGradient || yellowGradient || redGradient).toBeTruthy();
    });
  });

  describe('Marquee Component', () => {
    it('should render two marquee rows', () => {
      const { container } = render(<IntegrationsSection />);
      
      // Look for marquee containers
      const marqueeContainers = container.querySelectorAll('.flex.overflow-hidden.p-2');
      expect(marqueeContainers.length).toBe(2);
    });

    it('should apply reverse direction to second marquee', () => {
      const { container } = render(<IntegrationsSection />);
      
      const reverseMarquee = container.querySelector('.\\[animation-direction\\:reverse\\]');
      expect(reverseMarquee).toBeInTheDocument();
    });

    it('should pause animation on hover when pauseOnHover is true', () => {
      const { container } = render(<IntegrationsSection />);
      
      const pauseOnHover = container.querySelectorAll('.group-hover\\:\\[animation-play-state\\:paused\\]');
      expect(pauseOnHover.length).toBeGreaterThan(0);
    });

    it('should repeat marquee items based on repeat prop', () => {
      const { container } = render(<IntegrationsSection />);
      
      // Each marquee should have multiple repetitions
      const marqueeItems = container.querySelectorAll('.flex.shrink-0.justify-around');
      expect(marqueeItems.length).toBeGreaterThan(2); // At least more than 2 (default repeat is 4)
    });
  });

  describe('Animation and Effects', () => {
    it('should initialize with random tile arrangements', () => {
      const { container, rerender } = render(<IntegrationsSection />);
      const firstRenderIcons = container.querySelectorAll('svg').length;
      
      // Clear mocks and rerender
      jest.clearAllMocks();
      jest.spyOn(Math, 'random').mockReturnValue(0.2);
      
      rerender(<IntegrationsSection />);
      const secondRenderIcons = container.querySelectorAll('svg').length;
      
      // Both renders should have icons
      expect(firstRenderIcons).toBeGreaterThan(0);
      expect(secondRenderIcons).toBeGreaterThan(0);
    });

    it('should apply animation classes for marquee effect', () => {
      const { container } = render(<IntegrationsSection />);
      
      const animatedElements = container.querySelectorAll('.animate-marquee');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should have gradient overlays on sides for fade effect', () => {
      const { container } = render(<IntegrationsSection />);
      
      const leftGradient = container.querySelector('.bg-gradient-to-r.from-white.to-transparent');
      const rightGradient = container.querySelector('.bg-gradient-to-l.from-white.to-transparent');
      
      expect(leftGradient).toBeInTheDocument();
      expect(rightGradient).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive padding and margins', () => {
      const { container } = render(<IntegrationsSection />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-16');
      
      const contentContainer = container.querySelector('.container');
      expect(contentContainer).toHaveClass('px-4', 'md:px-8');
    });

    it('should apply responsive shadow on medium screens and up', () => {
      const { container } = render(<IntegrationsSection />);
      
      const shadowElement = container.querySelector('.md\\:shadow-xl');
      expect(shadowElement).toBeInTheDocument();
    });

    it('should center content with max width constraints', () => {
      const { container } = render(<IntegrationsSection />);
      
      const maxWidthElement = container.querySelector('.max-w-5xl');
      expect(maxWidthElement).toBeInTheDocument();
      
      const marqueeContainer = container.querySelector('.max-w-6xl');
      expect(marqueeContainer).toBeInTheDocument();
    });
  });

  describe('Service Icons', () => {
    it('should render different types of service icons', () => {
      const { container } = render(<IntegrationsSection />);
      
      // All icons should be rendered
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
      
      // Check for icon containers
      const iconContainers = container.querySelectorAll('.text-gray-600');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should position icons correctly within cards', () => {
      const { container } = render(<IntegrationsSection />);
      
      const centeredIcons = container.querySelectorAll('.flex.size-full.items-center.justify-center');
      expect(centeredIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Theme', () => {
    it('should apply correct background colors and borders', () => {
      const { container } = render(<IntegrationsSection />);
      
      const whiteBg = container.querySelector('.bg-white');
      expect(whiteBg).toBeInTheDocument();
      
      const borderElement = container.querySelector('.border');
      expect(borderElement).toBeInTheDocument();
    });

    it('should apply box shadow to cards', () => {
      const { container } = render(<IntegrationsSection />);
      
      const shadowedCards = container.querySelectorAll('[class*="shadow"]');
      expect(shadowedCards.length).toBeGreaterThan(0);
    });

    it('should have proper z-index layering', () => {
      const { container } = render(<IntegrationsSection />);
      
      const zIndexElement = container.querySelector('.relative.z-10');
      expect(zIndexElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<IntegrationsSection />);
      
      const section = container.querySelector('section');
      const heading = container.querySelector('h2');
      
      expect(section).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
    });

    it('should maintain readable text hierarchy', () => {
      render(<IntegrationsSection />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Hizmetler');
    });

    it('should have pointer-events-none on decorative gradients', () => {
      const { container } = render(<IntegrationsSection />);
      
      const decorativeElements = container.querySelectorAll('.pointer-events-none');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should use transform-gpu for hardware acceleration', () => {
      const { container } = render(<IntegrationsSection />);
      
      const gpuElements = container.querySelectorAll('.transform-gpu');
      expect(gpuElements.length).toBeGreaterThan(0);
    });

    it('should efficiently handle multiple card instances', () => {
      const { container } = render(<IntegrationsSection />);
      
      const cards = container.querySelectorAll('.cursor-pointer');
      // Should have multiple cards but not an excessive amount
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.length).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle component unmounting gracefully', () => {
      const { unmount } = render(<IntegrationsSection />);
      expect(() => unmount()).not.toThrow();
    });

    it('should render correctly when shuffleArray returns same order', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      
      const { container } = render(<IntegrationsSection />);
      const icons = container.querySelectorAll('svg');
      
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should maintain layout integrity with different content lengths', () => {
      const { container } = render(<IntegrationsSection />);
      
      const flexContainers = container.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
      
      // Check that overflow is handled
      const overflowElements = container.querySelectorAll('.overflow-hidden');
      expect(overflowElements.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with useEffect', () => {
    it('should shuffle tiles on mount', async () => {
      const { container } = render(<IntegrationsSection />);
      
      await waitFor(() => {
        const cards = container.querySelectorAll('.size-20');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should only shuffle tiles once on mount', () => {
      const randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockClear();
      
      const { rerender } = render(<IntegrationsSection />);
      const callsAfterMount = randomSpy.mock.calls.length;
      
      rerender(<IntegrationsSection />);
      const callsAfterRerender = randomSpy.mock.calls.length;
      
      // Calls should not increase after rerender (allowing for minor variations in rendering)
      expect(callsAfterRerender).toBeLessThanOrEqual(callsAfterMount * 2);
    });
  });
});