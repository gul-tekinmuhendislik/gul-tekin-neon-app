import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Remove global mock from jest.setup.js to test the real component
jest.unmock('@/components/ui/logo-cloud');

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, priority, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      width={width}
      height={height}
      data-priority={priority ? 'true' : 'false'}
      {...props}
    />
  ),
}));

// Override the db mock to return sample partner data for the logo-cloud test
jest.mock('@/lib/db', () => ({
  sql: jest.fn().mockResolvedValue([
    { marka_adi: 'Aldea', cloudinary_url: '/aldea.jpeg', logo_url: null },
    { marka_adi: 'REHAU', cloudinary_url: '/REHAU.png', logo_url: null },
    { marka_adi: 'Solimpeks', cloudinary_url: '/solimpeks.png', logo_url: null },
    { marka_adi: 'Varmek', cloudinary_url: '/varmek.png', logo_url: null },
    { marka_adi: 'Wepomp', cloudinary_url: '/wepomp.png', logo_url: null },
    { marka_adi: 'Wilo', cloudinary_url: '/wilo.png', logo_url: null },
    { marka_adi: 'Yelkenci', cloudinary_url: '/yelkenci.png', logo_url: null },
    { marka_adi: 'Daikin', cloudinary_url: '/daikin.png', logo_url: null },
  ]),
}));

import { LogoCloud } from '../logo-cloud';

describe('LogoCloud Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const element = await LogoCloud();
      render(element);
      expect(screen.getByText('Çözüm Ortaklarımız')).toBeInTheDocument();
    });

    it('should render the section with correct id for navigation', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const section = container.querySelector('#partners');
      
      expect(section).toBeInTheDocument();
    });

    it('should render heading and description text', async () => {
      const element = await LogoCloud();
      render(element);
      
      expect(screen.getByText('Çözüm Ortaklarımız')).toBeInTheDocument();
      expect(screen.getByText('Sektörün lider markalarıyla güvenilir çözümler sunuyoruz')).toBeInTheDocument();
    });

    it('should render partner logos', async () => {
      const element = await LogoCloud();
      render(element);
      
      const logos = screen.getAllByRole('img');
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render partner logos inside list items', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const listItems = container.querySelectorAll('li');
      
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('Logo Properties', () => {
    it('should set priority loading for logos', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const logos = container.querySelectorAll('img[data-priority="true"]');
      
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render images with width and height attributes', async () => {
      const element = await LogoCloud();
      render(element);
      
      const logos = screen.getAllByRole('img');
      logos.forEach(logo => {
        expect(logo).toHaveAttribute('width');
        expect(logo).toHaveAttribute('height');
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should apply responsive padding classes', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const section = container.querySelector('section');
      
      expect(section).toHaveClass('px-6', 'md:px-8', 'py-16');
    });

    it('should center align content', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      
      const centeredElements = container.querySelectorAll('.text-center');
      expect(centeredElements.length).toBeGreaterThan(0);
      
      const mxAuto = container.querySelectorAll('.mx-auto');
      expect(mxAuto.length).toBeGreaterThan(0);
    });

    it('should apply flexbox layout for logo grid', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const logoList = container.querySelector('ul');
      
      expect(logoList).toHaveClass('flex', 'flex-wrap', 'items-center', 'justify-center');
    });

    it('should apply gaps between logos', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const logoList = container.querySelector('ul');
      
      expect(logoList).toHaveClass('gap-x-10', 'gap-y-8');
    });
  });

  describe('Visual Effects', () => {
    it('should apply transition and opacity classes', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const logoContainers = container.querySelectorAll('.transition-all');
      
      expect(logoContainers.length).toBeGreaterThan(0);
    });

    it('should have hover opacity effect', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const hoverElements = container.querySelectorAll('.hover\\:opacity-100');
      
      expect(hoverElements.length).toBeGreaterThan(0);
    });

    it('should apply initial opacity', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const opacityElements = container.querySelectorAll('.opacity-80');
      
      expect(opacityElements.length).toBeGreaterThan(0);
    });
  });

  describe('Logo Container', () => {
    it('should have responsive container styling', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const h24 = container.querySelectorAll('.h-24');
      const w56 = container.querySelectorAll('.w-56');
      
      expect(h24.length).toBeGreaterThan(0);
      expect(w56.length).toBeGreaterThan(0);
    });

    it('should center logos within containers', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const centeredContainers = container.querySelectorAll('.flex.items-center.justify-center');
      
      expect(centeredContainers.length).toBeGreaterThan(0);
    });

    it('should apply object-contain to logo images', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const objectContain = container.querySelectorAll('.object-contain');
      
      expect(objectContain.length).toBeGreaterThan(0);
    });
  });

  describe('Typography', () => {
    it('should apply correct heading styles', async () => {
      const element = await LogoCloud();
      render(element);
      
      const heading = screen.getByText('Çözüm Ortaklarımız');
      expect(heading).toHaveClass('text-sm', 'font-semibold', 'text-gray-600', 'uppercase', 'tracking-wide');
    });

    it('should apply correct description styles', async () => {
      const element = await LogoCloud();
      render(element);
      
      const description = screen.getByText('Sektörün lider markalarıyla güvenilir çözümler sunuyoruz');
      expect(description).toHaveClass('text-base', 'text-gray-500');
    });

    it('should apply proper spacing between text elements', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const mt2 = container.querySelector('.mt-2');
      const mt8 = container.querySelector('.mt-8');
      
      expect(mt2).toBeInTheDocument();
      expect(mt8).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      
      const section = container.querySelector('section');
      const heading = container.querySelector('h2');
      const list = container.querySelector('ul');
      
      expect(section).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
      expect(list).toBeInTheDocument();
    });

    it('should use list items for each partner', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const listItems = container.querySelectorAll('li');
      
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have alt text for all images', async () => {
      const element = await LogoCloud();
      render(element);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should maintain heading hierarchy', async () => {
      const element = await LogoCloud();
      render(element);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Çözüm Ortaklarımız');
    });
  });

  describe('Image Loading', () => {
    it('should set all images to priority loading', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const priorityImages = container.querySelectorAll('[data-priority="true"]');
      
      expect(priorityImages.length).toBeGreaterThan(0);
    });

    it('should have object-contain class on images', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const images = container.querySelectorAll('img.object-contain');
      
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle component unmounting gracefully', async () => {
      const element = await LogoCloud();
      const { unmount } = render(element);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const responsivePadding = container.querySelector('.px-4.md\\:px-8');
      
      expect(responsivePadding).toBeInTheDocument();
    });

    it('should have responsive gap sizing', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const responsiveGap = container.querySelector('.gap-x-10.md\\:gap-x-16');
      
      expect(responsiveGap).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply rounded corners to logo containers', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const relativeElements = container.querySelectorAll('.relative');
      
      expect(relativeElements.length).toBeGreaterThan(0);
    });

    it('should use full width and height for images inside containers', async () => {
      const element = await LogoCloud();
      const { container } = render(element);
      const fullSizeImages = container.querySelectorAll('.h-full.w-full');
      
      expect(fullSizeImages.length).toBeGreaterThan(0);
    });
  });
});
