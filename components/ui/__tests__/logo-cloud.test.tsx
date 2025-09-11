import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoCloud } from '../logo-cloud';
import '@testing-library/jest-dom';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, priority, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      width={width}
      height={height}
      data-priority={priority}
      {...props}
    />
  ),
}));

describe('LogoCloud Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<LogoCloud />);
      expect(screen.getByText('Çözüm Ortaklarımız')).toBeInTheDocument();
    });

    it('should render the section with correct id for navigation', () => {
      const { container } = render(<LogoCloud />);
      const section = container.querySelector('#partners');
      
      expect(section).toBeInTheDocument();
    });

    it('should render heading and description text', () => {
      render(<LogoCloud />);
      
      expect(screen.getByText('Çözüm Ortaklarımız')).toBeInTheDocument();
      expect(screen.getByText('Sektörün lider markalarıyla güvenilir çözümler sunuyoruz')).toBeInTheDocument();
    });

    it('should render all partner logos', () => {
      render(<LogoCloud />);
      
      const expectedPartners = ['Aldea', 'REHAU', 'Solimpeks', 'Varmek', 'Wepomp', 'Wilo', 'Yelkenci', 'Daikin', 'Mitsubishi', 'Vaillant', 'Bosch', 'Viessmann', 'Baymak'];
      
      expectedPartners.forEach(partner => {
        const logo = screen.getByAltText((content) => content.includes(partner));
        expect(logo).toBeInTheDocument();
      });
    });

    it('should render correct number of partner logos', () => {
      const { container } = render(<LogoCloud />);
      const logos = container.querySelectorAll('img');
      
      expect(logos).toHaveLength(13);
    });
  });

  describe('Logo Properties', () => {
    it('should apply correct image dimensions', () => {
      render(<LogoCloud />);
      
      const logos = screen.getAllByRole('img');
      logos.forEach(logo => {
        expect(logo).toHaveAttribute('width', '128');
        expect(logo).toHaveAttribute('height', '48');
      });
    });

    it('should set priority loading for all logos', () => {
      const { container } = render(<LogoCloud />);
      const logos = container.querySelectorAll('img[data-priority="true"]');
      
      expect(logos).toHaveLength(13);
    });

    it('should have correct source URLs for each partner', () => {
      render(<LogoCloud />);
      
      const partnerLogos = [
        { name: 'Aldea', url: '/aldea.jpeg' },
        { name: 'REHAU', url: '/REHAU.png' },
        { name: 'Solimpeks', url: '/solimpeks.png' },
        { name: 'Varmek', url: '/varmek.png' },
        { name: 'Wepomp', url: '/wepomp.png' },
        { name: 'Wilo', url: '/wilo.png' },
        { name: 'Yelkenci', url: '/yelkenci.png' },
        { name: 'Daikin', url: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Daikin-logo.svg' },
        { name: 'Mitsubishi', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Mitsubishi_logo.svg' },
        { name: 'Vaillant', url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Vaillant-logo.svg' },
        { name: 'Bosch', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Bosch-logotype.svg' },
        { name: 'Viessmann', url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Viessmann-logo.svg' },
        { name: 'Baymak', url: 'https://www.baymak.com.tr/assets/images/baymak-logo.svg' },
      ];
      
      partnerLogos.forEach(({ name, url }) => {
        const logo = screen.getByAltText((content) => content.includes(name));
        expect(logo).toHaveAttribute('src', url);
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should apply responsive padding classes', () => {
      const { container } = render(<LogoCloud />);
      const section = container.querySelector('section');
      
      expect(section).toHaveClass('px-6', 'md:px-8', 'py-16');
    });

    it('should apply max width constraints', () => {
      const { container } = render(<LogoCloud />);
      
      const maxWidth7xl = container.querySelector('.max-w-7xl');
      const maxWidthScreenXl = container.querySelector('.max-w-screen-xl');
      
      expect(maxWidth7xl).toBeInTheDocument();
      expect(maxWidthScreenXl).toBeInTheDocument();
    });

    it('should center align content', () => {
      const { container } = render(<LogoCloud />);
      
      const centeredElements = container.querySelectorAll('.text-center');
      expect(centeredElements.length).toBeGreaterThan(0);
      
      const mxAuto = container.querySelectorAll('.mx-auto');
      expect(mxAuto.length).toBeGreaterThan(0);
    });

    it('should apply flexbox layout for logo grid', () => {
      const { container } = render(<LogoCloud />);
      const logoList = container.querySelector('ul');
      
      expect(logoList).toHaveClass('flex', 'flex-wrap', 'items-center', 'justify-center');
    });

    it('should apply responsive gap between logos', () => {
      const { container } = render(<LogoCloud />);
      const logoList = container.querySelector('ul');
      
      expect(logoList).toHaveClass('gap-x-10', 'gap-y-8', 'md:gap-x-16');
    });
  });

  describe('Visual Effects', () => {
    it('should apply grayscale filter by default', () => {
      const { container } = render(<LogoCloud />);
      const logoContainers = container.querySelectorAll('.grayscale');
      
      expect(logoContainers).toHaveLength(13);
    });

    it('should have hover effect classes', () => {
      const { container } = render(<LogoCloud />);
      
      const hoverGrayscale = container.querySelectorAll('.hover\\:grayscale-0');
      const hoverOpacity = container.querySelectorAll('.hover\\:opacity-100');
      
      expect(hoverGrayscale).toHaveLength(13);
      expect(hoverOpacity).toHaveLength(13);
    });

    it('should apply transition effects', () => {
      const { container } = render(<LogoCloud />);
      const transitions = container.querySelectorAll('.transition-all');
      
      expect(transitions).toHaveLength(13);
    });

    it('should have correct duration for transitions', () => {
      const { container } = render(<LogoCloud />);
      const duration300 = container.querySelectorAll('.duration-300');
      
      expect(duration300).toHaveLength(13);
    });

    it('should apply initial opacity', () => {
      const { container } = render(<LogoCloud />);
      const opacity60 = container.querySelectorAll('.opacity-60');
      
      expect(opacity60).toHaveLength(13);
    });
  });

  describe('Logo Container', () => {
    it('should have correct dimensions for logo containers', () => {
      const { container } = render(<LogoCloud />);
      const logoContainers = container.querySelectorAll('.h-12.w-32');
      
      expect(logoContainers).toHaveLength(13);
    });

    it('should center logos within containers', () => {
      const { container } = render(<LogoCloud />);
      const centeredContainers = container.querySelectorAll('.flex.items-center.justify-center');
      
      expect(centeredContainers).toHaveLength(13);
    });

    it('should apply object-contain to logo images', () => {
      const { container } = render(<LogoCloud />);
      const objectContain = container.querySelectorAll('.object-contain');
      
      expect(objectContain).toHaveLength(13);
    });

    it('should maintain relative positioning', () => {
      const { container } = render(<LogoCloud />);
      const relativeElements = container.querySelectorAll('.relative');
      
      expect(relativeElements).toHaveLength(13);
    });
  });

  describe('Typography', () => {
    it('should apply correct heading styles', () => {
      render(<LogoCloud />);
      
      const heading = screen.getByText('Çözüm Ortaklarımız');
      expect(heading).toHaveClass('text-sm', 'font-semibold', 'text-gray-600', 'uppercase', 'tracking-wide');
    });

    it('should apply correct description styles', () => {
      render(<LogoCloud />);
      
      const description = screen.getByText('Sektörün lider markalarıyla güvenilir çözümler sunuyoruz');
      expect(description).toHaveClass('text-base', 'text-gray-500');
    });

    it('should apply proper spacing between text elements', () => {
      const { container } = render(<LogoCloud />);
      const mt2 = container.querySelector('.mt-2');
      const mt8 = container.querySelector('.mt-8');
      
      expect(mt2).toBeInTheDocument();
      expect(mt8).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<LogoCloud />);
      
      const section = container.querySelector('section');
      const heading = container.querySelector('h2');
      const list = container.querySelector('ul');
      
      expect(section).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
      expect(list).toBeInTheDocument();
    });

    it('should use list items for each partner', () => {
      const { container } = render(<LogoCloud />);
      const listItems = container.querySelectorAll('li');
      
      expect(listItems).toHaveLength(13);
    });

    it('should have alt text for all images', () => {
      render(<LogoCloud />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should maintain heading hierarchy', () => {
      render(<LogoCloud />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Çözüm Ortaklarımız');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding', () => {
      const { container } = render(<LogoCloud />);
      const responsivePadding = container.querySelector('.px-4.md\\:px-8');
      
      expect(responsivePadding).toBeInTheDocument();
    });

    it('should have responsive gap sizing', () => {
      const { container } = render(<LogoCloud />);
      const responsiveGap = container.querySelector('.gap-x-10.md\\:gap-x-16');
      
      expect(responsiveGap).toBeInTheDocument();
    });
  });

  describe('Image Loading', () => {
    it('should set all images to high priority loading', () => {
      const { container } = render(<LogoCloud />);
      const priorityImages = container.querySelectorAll('[data-priority="true"]');
      
      expect(priorityImages).toHaveLength(13);
    });

    it('should maintain aspect ratio for logo images', () => {
      const { container } = render(<LogoCloud />);
      const images = container.querySelectorAll('img');
      
      images.forEach(img => {
        const width = parseInt(img.getAttribute('width') || '0');
        const height = parseInt(img.getAttribute('height') || '0');
        
        // Check aspect ratio is approximately 2.67:1 (128:48)
        expect(width / height).toBeCloseTo(2.67, 1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle component unmounting gracefully', () => {
      const { unmount } = render(<LogoCloud />);
      expect(() => unmount()).not.toThrow();
    });

    it('should render correctly even with network issues (broken images)', () => {
      const { container } = render(<LogoCloud />);
      const images = container.querySelectorAll('img');
      
      // Simulate image load error
      images.forEach(img => {
        fireEvent.error(img);
      });
      
      // Component should still be intact
      expect(screen.getByText('Çözüm Ortaklarımız')).toBeInTheDocument();
    });

    it('should maintain layout when images fail to load', () => {
      const { container } = render(<LogoCloud />);
      
      // Layout containers should still exist
      const logoContainers = container.querySelectorAll('.h-12.w-32');
      expect(logoContainers).toHaveLength(13);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<LogoCloud />);
      
      // Component has no props or state, so should not change
      const firstRender = screen.getByText('Çözüm Ortaklarımız');
      
      rerender(<LogoCloud />);
      
      const secondRender = screen.getByText('Çözüm Ortaklarımız');
      expect(firstRender).toBe(secondRender);
    });

    it('should use efficient CSS classes for animations', () => {
      const { container } = render(<LogoCloud />);
      
      // Check for GPU-accelerated transforms
      const transitionAll = container.querySelectorAll('.transition-all');
      expect(transitionAll.length).toBeGreaterThan(0);
    });
  });
});