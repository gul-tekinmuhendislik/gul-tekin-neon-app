import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';
import '@testing-library/jest-dom';

// Mock lib/db to prevent actual DB connection
jest.mock('@/lib/db', () => ({
  sql: jest.fn().mockResolvedValue([{ count: 500 }]),
}));

// Mock get-brands to return test data
jest.mock('@/lib/get-brands', () => ({
  getRandomBrands: jest.fn().mockResolvedValue(['Daikin', 'Vaillant', 'Bosch']),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, priority, ...props }: any) => (
    <img 
      src={typeof src === 'string' ? src : src?.src || ''} 
      alt={alt} 
      className={className}
      width={width}
      height={height}
      data-priority={priority}
      {...props}
    />
  ),
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/gul-tekin-hero', () => ({
  Vortex: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="vortex" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/integrations-section', () => ({
  IntegrationsSection: () => (
    <div data-testid="integrations-section">IntegrationsSection</div>
  ),
}));

jest.mock('@/components/ui/logo-cloud', () => ({
  LogoCloud: () => (
    <div data-testid="logo-cloud">LogoCloud</div>
  ),
}));

// Mock all other page sub-components
jest.mock('@/components/Testimonials', () => ({
  __esModule: true,
  default: () => <div data-testid="testimonials">Testimonials</div>,
}));

jest.mock('@/components/DatabaseStats', () => ({
  __esModule: true,
  default: () => <div data-testid="database-stats">DatabaseStats</div>,
}));

jest.mock('@/components/ServiceLocations', () => ({
  __esModule: true,
  default: () => <div data-testid="service-locations">ServiceLocations</div>,
}));

jest.mock('@/components/HeatPumps', () => ({
  __esModule: true,
  default: () => <div data-testid="heat-pumps">HeatPumps</div>,
}));

jest.mock('@/components/VarmeksProducts', () => ({
  __esModule: true,
  default: () => <div data-testid="varmeks-products">VarmeksProducts</div>,
}));

jest.mock('@/components/AldeaProducts', () => ({
  __esModule: true,
  default: () => <div data-testid="aldea-products">AldeaProducts</div>,
}));

jest.mock('@/components/LGProducts', () => ({
  __esModule: true,
  default: () => <div data-testid="lg-products">LGProducts</div>,
}));

jest.mock('@/components/ui/flip-words', () => ({
  FlipWords: ({ words, className, ...props }: any) => (
    <span className={className} {...props}>{words?.[0] || ''}</span>
  ),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      render(await Home());
      
      await waitFor(() => {
        expect(screen.getByTestId('vortex')).toBeInTheDocument();
      });
    });

    it('should render all main sections', async () => {
      render(await Home());
      
      await waitFor(() => {
        expect(screen.getByTestId('vortex')).toBeInTheDocument();
        expect(screen.getByTestId('integrations-section')).toBeInTheDocument();
        expect(screen.getByTestId('logo-cloud')).toBeInTheDocument();
        expect(screen.getByTestId('aldea-products')).toBeInTheDocument();
      });
    });

    it('should render the company title', async () => {
      render(await Home());
      
      await waitFor(() => {
        const title = screen.getByRole('heading', { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title.innerHTML).toContain('Gül-Tekin');
        expect(title.innerHTML).toContain('Mühendislik');
      });
    });

    it('should render the company description', async () => {
      render(await Home());
      
      await waitFor(() => {
        // Check for the description text (which includes HTML)
        const description = screen.getByText((content, element) => {
          return element !== null && content.includes('uzman mühendis kadrosu');
        });
        expect(description).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should render the main CTA button', async () => {
      render(await Home());
      
      await waitFor(() => {
        const ctaButton = screen.getByRole('link', { name: 'Hizmetlerimiz' });
        expect(ctaButton).toBeInTheDocument();
        expect(ctaButton).toHaveAttribute('href', '/services');
      });
    });

    it('should render the secondary link', async () => {
      render(await Home());
      
      await waitFor(() => {
        const contactLink = screen.getByRole('link', { name: /İletişime Geç/ });
        expect(contactLink).toBeInTheDocument();
        expect(contactLink).toHaveAttribute('href', '/contact');
      });
    });

    it('should render secondary CTA link', async () => {
      render(await Home());
      
      await waitFor(() => {
        const contactLink = screen.getByRole('link', { name: /İletişime Geç/ });
        expect(contactLink).toBeInTheDocument();
        expect(contactLink).toHaveAttribute('href', '/contact');
      });
    });
  });

  describe('Logo Display', () => {
    it('should render the Neon logo', async () => {
      render(await Home());
      
      await waitFor(() => {
        const logos = screen.getAllByAltText((content) => content.includes('Gül-Tekin Mühendislik logosu'));
        expect(logos.length).toBeGreaterThan(0);
      });
    });

    it('should have priority loading for logo images', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const priorityLogos = container.querySelectorAll('img[data-priority="true"]');
        const logoImages = Array.from(priorityLogos).filter(img => 
          img.getAttribute('alt')?.includes('Gül-Tekin Mühendislik logosu')
        );
        expect(logoImages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Sub-components', () => {
    it('should render Testimonials sub-component', async () => {
      render(await Home());
      await waitFor(() => {
        expect(screen.getByTestId('testimonials')).toBeInTheDocument();
      });
    });

    it('should render DatabaseStats sub-component', async () => {
      render(await Home());
      await waitFor(() => {
        expect(screen.getByTestId('database-stats')).toBeInTheDocument();
      });
    });

    it('should render all sub-components', async () => {
      const result = await Home();
      const { container } = render(result);
      
      await waitFor(() => {
        expect(container.querySelector('[data-testid="testimonials"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="database-stats"]')).toBeInTheDocument();
      });
    });
  });

  describe('Vortex Component Integration', () => {
    it('should pass correct props to Vortex component', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const vortex = screen.getByTestId('vortex');
        expect(vortex).toHaveAttribute('data-testid', 'vortex');
      });
    });

    it('should render content inside Vortex component', async () => {
      render(await Home());
      
      await waitFor(() => {
        const vortex = screen.getByTestId('vortex');
        
        // Check if main content is inside Vortex
        const mainContent = vortex.querySelector('main');
        expect(mainContent).toBeInTheDocument();
        
        // Check if footer is inside Vortex
        const footer = vortex.querySelector('footer');
        expect(footer).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct container classes', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const mainDiv = container.querySelector('.flex.min-h-screen.flex-col.bg-white');
        expect(mainDiv).toBeInTheDocument();
      });
    });

    it('should apply responsive padding and margins', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const responsiveContainer = container.querySelector('.px-5.md\\:px-0');
        expect(responsiveContainer).toBeInTheDocument();
      });
    });

    it('should apply correct CTA button styles', async () => {
      render(await Home());
      
      await waitFor(() => {
        const ctaButton = screen.getByRole('link', { name: 'Hizmetlerimiz' });
        expect(ctaButton).toHaveClass('rounded-full', 'bg-[#00E599]', 'font-semibold');
      });
    });

    it('should apply hover effects to links', async () => {
      render(await Home());
      
      await waitFor(() => {
        const ctaButton = screen.getByRole('link', { name: 'Hizmetlerimiz' });
        expect(ctaButton).toHaveClass('hover:bg-[#00E5BF]', 'hover:scale-105');
        
        const contactLink = screen.getByRole('link', { name: /İletişime Geç/ });
        expect(contactLink).toHaveClass('hover:text-[#00E599]');
      });
    });
  });

  describe('Footer', () => {
    it('should render footer with border', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const footer = container.querySelector('footer');
        expect(footer).toHaveClass('border-t', 'border-gray-200', 'py-5');
      });
    });

    it('should render footer element', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const footer = container.querySelector('footer');
        expect(footer).toBeInTheDocument();
      });
    });

    it('should apply responsive footer padding', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const footer = container.querySelector('footer');
        expect(footer).toHaveClass('py-5', 'md:pb-12', 'md:pt-10');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const main = container.querySelector('main');
        const footer = container.querySelector('footer');
        const heading = container.querySelector('h1');
        
        expect(main).toBeInTheDocument();
        expect(footer).toBeInTheDocument();
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(await Home());
      
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toBeInTheDocument();
      });
    });

    it('should have accessible links', async () => {
      render(await Home());
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        
        links.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      });
    });

    it('should have alt text for all images', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const images = container.querySelectorAll('img');
        
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
        });
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', async () => {
      render(await Home());
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('text-3xl', 'md:text-4xl', 'lg:text-5xl');
        
        // Check for description paragraph with the actual class names
        const description = screen.getByText((content, element) => {
          return element !== null && content.includes('uzman mühendis kadrosu');
        });
        expect(description).toBeInTheDocument();
      });
    });

    it('should have responsive container widths', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const contentContainer = container.querySelector('.max-w-md.md\\:max-w-lg.lg\\:max-w-xl');
        expect(contentContainer).toBeInTheDocument();
      });
    });

    it('should have responsive button padding', async () => {
      render(await Home());
      
      await waitFor(() => {
        const ctaButton = screen.getByRole('link', { name: 'Hizmetlerimiz' });
        expect(ctaButton).toHaveClass('px-5', 'py-2.5', 'lg:px-7', 'lg:py-3');
      });
    });
  });

  describe('Integration', () => {
    it('should render all major components together', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        // Check for presence of all major sections
        expect(screen.getByTestId('vortex')).toBeInTheDocument();
        expect(screen.getByTestId('integrations-section')).toBeInTheDocument();
        expect(screen.getByTestId('logo-cloud')).toBeInTheDocument();
        
        // Check for main content elements
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Hizmetlerimiz' })).toBeInTheDocument();
        
        // Check for footer
        expect(container.querySelector('footer')).toBeInTheDocument();
      });
    });

    it('should maintain proper component hierarchy', async () => {
      const { container } = render(await Home());
      
      await waitFor(() => {
        const mainContainer = container.querySelector('.flex.min-h-screen.flex-col');
        const vortex = mainContainer?.querySelector('[data-testid="vortex"]');
        const integrations = mainContainer?.querySelector('[data-testid="integrations-section"]');
        const logoCloud = mainContainer?.querySelector('[data-testid="logo-cloud"]');
        
        expect(mainContainer).toBeInTheDocument();
        expect(vortex).toBeInTheDocument();
        expect(integrations).toBeInTheDocument();
        expect(logoCloud).toBeInTheDocument();
      });
    });
  });
});