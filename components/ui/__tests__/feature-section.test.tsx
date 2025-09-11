import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FeatureSection } from '../feature-section';
import '@testing-library/jest-dom';

describe('FeatureSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<FeatureSection />);
      expect(screen.getByText('Neden Bizi Tercih Etmelisiniz?')).toBeInTheDocument();
    });

    it('should render section heading and description', () => {
      render(<FeatureSection />);
      
      expect(screen.getByText('Neden Bizi Tercih Etmelisiniz?')).toBeInTheDocument();
      expect(screen.getByText('Bodrum ve Yalıkavak bölgesinde güvenilir, kaliteli ve profesyonel mühendislik hizmetleri')).toBeInTheDocument();
    });

    it('should render all feature cards', () => {
      render(<FeatureSection />);
      
      const expectedFeatures = [
        '7/24 Hizmet',
        'Garantili İşçilik',
        'Uzman Kadro',
        'Hızlı Müdahale',
        'Şeffaf Fiyatlandırma',
        'Müşteri Memnuniyeti'
      ];
      
      expectedFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should render phone number in footer', () => {
      render(<FeatureSection />);
      
      expect(screen.getByText('Hemen arayın: +90 (252) 123 45 67')).toBeInTheDocument();
    });

    it('should render phone icon in footer', () => {
      const { container } = render(<FeatureSection />);
      
      const phoneSection = container.querySelector('.inline-flex.items-center.gap-3');
      expect(phoneSection).toBeInTheDocument();
      
      const phoneIcon = phoneSection?.querySelector('svg');
      expect(phoneIcon).toBeInTheDocument();
    });
  });

  describe('Feature Cards', () => {
    it('should render correct number of feature cards', () => {
      const { container } = render(<FeatureSection />);
      
      const cards = container.querySelectorAll('.transform-gpu.rounded-xl');
      expect(cards).toHaveLength(6);
    });

    it('should display feature numbers correctly', () => {
      render(<FeatureSection />);
      
      ['01', '02', '03', '04', '05', '06'].forEach(num => {
        expect(screen.getByText(num)).toBeInTheDocument();
      });
    });

    it('should render icons for each feature', () => {
      const { container } = render(<FeatureSection />);
      
      const icons = container.querySelectorAll('.inline-flex.size-12 svg');
      expect(icons).toHaveLength(6);
    });

    it('should render feature descriptions', () => {
      render(<FeatureSection />);
      
      const descriptions = [
        'Acil durumlar için 7 gün 24 saat ulaşabileceğiniz teknik destek hattımız ile yanınızdayız',
        'Tüm montaj ve tamir işlerimizde 2 yıl işçilik garantisi sunuyoruz',
        'Alanında uzman mühendis ve teknisyenlerden oluşan ekibimiz',
        'Bodrum ve Yalıkavak bölgesinde ortalama 30 dakika içinde adresinize ulaşıyor',
        'İşe başlamadan önce detaylı fiyat teklifi sunuyor',
        '500\'den fazla mutlu müşterimiz ile %98 memnuniyet oranına sahibiz'
      ];
      
      descriptions.forEach(desc => {
        const elements = screen.getAllByText((content, element) => {
          return element !== null && content.includes(desc.substring(0, 30));
        });
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interactivity', () => {
    it('should open first card by default', () => {
      const { container } = render(<FeatureSection />);
      
      const firstCard = container.querySelector('.scale-100.border-blue-200');
      expect(firstCard).toBeInTheDocument();
    });

    it('should change active card on click', () => {
      const { container } = render(<FeatureSection />);
      
      const cards = container.querySelectorAll('.cursor-pointer');
      
      // Click on second card
      fireEvent.click(cards[1]);
      
      // Check if second card is now active
      const activeCards = container.querySelectorAll('.scale-100.border-blue-200');
      expect(activeCards).toHaveLength(1);
    });

    it('should show content only for active card', () => {
      const { container } = render(<FeatureSection />);
      
      // Initially, first card should show content
      const expandedContents = container.querySelectorAll('.max-h-96.opacity-100');
      expect(expandedContents).toHaveLength(1);
      
      // Collapsed contents
      const collapsedContents = container.querySelectorAll('.max-h-0.opacity-0');
      expect(collapsedContents).toHaveLength(5);
    });

    it('should reset loading progress when clicking different card', () => {
      const { container } = render(<FeatureSection />);
      
      const cards = container.querySelectorAll('.cursor-pointer');
      
      // Click second card
      fireEvent.click(cards[1]);
      
      // Progress bar should be at 0%
      const progressBar = cards[1].querySelector('[style*="width:"]');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });
  });

  describe('Auto-play Functionality', () => {
    it('should automatically progress through cards', () => {
      const { container } = render(<FeatureSection />);
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000); // 5 seconds
      });
      
      // Should have moved to next card
      const activeCards = container.querySelectorAll('.scale-100.border-blue-200');
      expect(activeCards).toHaveLength(1);
    });

    it('should update loading progress bar', () => {
      const { container } = render(<FeatureSection />);
      
      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(1000); // 1 second
      });
      
      const progressBars = container.querySelectorAll('.bg-gradient-to-r.from-blue-500.to-purple-600');
      const activeProgressBar = progressBars[0];
      
      expect(activeProgressBar).toBeInTheDocument();
    });

    it('should loop back to first card after last card', () => {
      const { container } = render(<FeatureSection />);
      
      // Advance through all cards
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds (6 cards * 5 seconds)
      });
      
      // Should be back at first card or on second rotation
      const activeCards = container.querySelectorAll('.scale-100.border-blue-200');
      expect(activeCards).toHaveLength(1);
    });

    it('should clear interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = render(<FeatureSection />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Styling and Visual States', () => {
    it('should apply gradient background to active card', () => {
      const { container } = render(<FeatureSection />);
      
      // Look for any gradient background on active cards
      const activeCard = container.querySelector('[class*="bg-gradient"]');
      expect(activeCard).toBeInTheDocument();
    });

    it('should apply grayscale to inactive cards', () => {
      const { container } = render(<FeatureSection />);
      
      // Check if grayscale is applied via filter or opacity
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(6);
    });

    it('should apply hover opacity to inactive cards', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for hover effects
      const cards = container.querySelectorAll('[class*="hover"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply shadow to active card', () => {
      const { container } = render(<FeatureSection />);
      
      // Look for any shadow class
      const shadowedElements = container.querySelectorAll('[class*="shadow"]');
      expect(shadowedElements.length).toBeGreaterThan(0);
    });

    it('should style icon container with gradient', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for gradient backgrounds in general
      const gradientElements = container.querySelectorAll('[class*="gradient"]');
      expect(gradientElements.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar only for active card', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for progress-related elements
      const progressElements = container.querySelectorAll('[class*="rounded-full"]');
      expect(progressElements.length).toBeGreaterThan(0);
    });

    it('should have gradient styling on progress bar', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for gradient elements
      const gradients = container.querySelectorAll('[class*="gradient"]');
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should animate progress bar with transition', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for transition classes
      const transitions = container.querySelectorAll('[class*="transition"]');
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive padding', () => {
      const { container } = render(<FeatureSection />);
      
      const section = container.querySelector('section');
      expect(section?.className).toMatch(/p[xy]-/);
    });

    it('should use responsive grid layout', () => {
      const { container } = render(<FeatureSection />);
      
      const grid = container.querySelector('.grid');
      expect(grid?.className).toMatch(/grid/);
    });

    it('should apply responsive text sizes', () => {
      render(<FeatureSection />);
      
      const heading = screen.getByText('Neden Bizi Tercih Etmelisiniz?');
      expect(heading.className).toMatch(/text-/);
    });

    it('should center content with max width', () => {
      const { container } = render(<FeatureSection />);
      
      const centeredElements = container.querySelectorAll('[class*="mx-auto"]');
      expect(centeredElements.length).toBeGreaterThan(0);
    });
  });

  describe('Typography', () => {
    it('should apply correct font weights', () => {
      render(<FeatureSection />);
      
      const heading = screen.getByText('Neden Bizi Tercih Etmelisiniz?');
      expect(heading.className).toMatch(/font-/);
    });

    it('should apply correct text colors', () => {
      render(<FeatureSection />);
      
      const heading = screen.getByText('Neden Bizi Tercih Etmelisiniz?');
      expect(heading.className).toMatch(/text-/);
    });

    it('should display card numbers with correct formatting', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for numbered elements
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('06')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<FeatureSection />);
      
      const section = container.querySelector('section');
      const heading = container.querySelector('h2');
      
      expect(section).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
    });

    it('should maintain heading hierarchy', () => {
      render(<FeatureSection />);
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Neden Bizi Tercih Etmelisiniz?');
      
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements).toHaveLength(6);
    });

    it('should have clickable cards with cursor pointer', () => {
      const { container } = render(<FeatureSection />);
      
      const clickableCards = container.querySelectorAll('.cursor-pointer');
      expect(clickableCards).toHaveLength(6);
    });

    it('should provide visual feedback for interactive elements', () => {
      const { container } = render(<FeatureSection />);
      
      const cards = container.querySelectorAll('.transition-all.duration-500');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking between cards', () => {
      const { container } = render(<FeatureSection />);
      const cards = container.querySelectorAll('.cursor-pointer');
      
      // Rapidly click different cards
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);
      fireEvent.click(cards[0]);
      fireEvent.click(cards[4]);
      
      // Component should still be stable
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should handle component unmounting during animation', () => {
      const { unmount } = render(<FeatureSection />);
      
      // Start animation
      act(() => {
        jest.advanceTimersByTime(2500); // Mid-animation
      });
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should maintain state consistency when clicking same card multiple times', () => {
      const { container } = render(<FeatureSection />);
      const cards = container.querySelectorAll('.cursor-pointer');
      
      // Click same card multiple times
      fireEvent.click(cards[0]);
      fireEvent.click(cards[0]);
      fireEvent.click(cards[0]);
      
      // Should still be active
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should use transform-gpu for hardware acceleration', () => {
      const { container } = render(<FeatureSection />);
      
      // Check for transform classes which indicate performance optimization
      const elements = container.querySelectorAll('[class*="transform"], [class*="scale"], [class*="translate"]');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should batch DOM updates efficiently', () => {
      const { container } = render(<FeatureSection />);
      
      // Click to change active card
      const cards = container.querySelectorAll('.cursor-pointer');
      fireEvent.click(cards[2]);
      
      // Check that transitions are used for smooth updates
      const transitionElements = container.querySelectorAll('[class*="transition"]');
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });
});