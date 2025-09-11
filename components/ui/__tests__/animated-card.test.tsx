import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimatedCard } from '../animated-card';
import '@testing-library/jest-dom';

describe('AnimatedCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(
        <AnimatedCard>
          <div>Card Content</div>
        </AnimatedCard>
      );
      
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <AnimatedCard>
          <h2>Title</h2>
          <p>Description</p>
        </AnimatedCard>
      );
      
      expect(screen.getByRole('heading')).toHaveTextContent('Title');
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <AnimatedCard className="custom-class">
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should render arrow icon when withArrow is true', () => {
      const { container } = render(
        <AnimatedCard withArrow={true}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const arrow = container.querySelector('.absolute.right-4.top-4 svg');
      expect(arrow).toBeInTheDocument();
    });

    it('should not render arrow icon when withArrow is false', () => {
      const { container } = render(
        <AnimatedCard withArrow={false}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const arrow = container.querySelector('.absolute.right-4.top-4 svg');
      expect(arrow).not.toBeInTheDocument();
    });
  });

  describe('Structure and Layout', () => {
    it('should have correct structure with gradient effect container', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      // Main container
      const mainContainer = container.querySelector('.group.relative');
      expect(mainContainer).toBeInTheDocument();
      
      // Gradient effect div
      const gradientDiv = container.querySelector('.absolute.-translate-x-1\\/2.-translate-y-1\\/2');
      expect(gradientDiv).toBeInTheDocument();
      
      // Inner background
      const innerBg = container.querySelector('.absolute.inset-\\[1px\\].bg-white');
      expect(innerBg).toBeInTheDocument();
      
      // Content wrapper
      const contentWrapper = container.querySelector('.relative.z-10');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('should apply transform and transition classes', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('transform-gpu', 'transition-all', 'duration-300');
    });

    it('should apply hover scale effect', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('hover:scale-[1.02]');
    });

    it('should apply active scale effect', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('active:scale-[0.98]');
    });
  });

  describe('Mouse Interactions', () => {
    it('should track mouse position on hover', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Simulate mouse enter
      fireEvent.mouseEnter(card);
      
      // Simulate mouse move
      fireEvent.mouseMove(window, {
        clientX: 100,
        clientY: 100,
      });
      
      // Check if gradient is visible
      const gradient = container.querySelector('.opacity-100.scale-100');
      expect(gradient).toBeInTheDocument();
    });

    it('should hide gradient on mouse leave', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Simulate mouse enter and leave
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      
      // Gradient should be hidden
      const gradient = container.querySelector('.opacity-0.scale-0');
      expect(gradient).toBeInTheDocument();
    });

    it('should update gradient position based on mouse movement', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Mock getBoundingClientRect
      card.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 200,
        bottom: 200,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      // Simulate mouse enter
      fireEvent.mouseEnter(card);
      
      // Simulate mouse move
      fireEvent.mouseMove(window, {
        clientX: 50,
        clientY: 50,
      });
      
      const gradient = container.querySelector('[style*="left:"][style*="top:"]');
      expect(gradient).toBeInTheDocument();
    });

    it('should cleanup mouse move listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });
  });

  describe('Gradient Customization', () => {
    it('should use default gradient colors when not specified', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const gradient = container.querySelector('[style*="radial-gradient"]');
      expect(gradient).toBeInTheDocument();
      
      const style = gradient?.getAttribute('style');
      expect(style).toContain('#3BC4F2');
      expect(style).toContain('#7A69F9');
      expect(style).toContain('#F26378');
      expect(style).toContain('#F5833F');
    });

    it('should apply custom gradient colors', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      
      const { container } = render(
        <AnimatedCard gradientColors={customColors}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const gradient = container.querySelector('[style*="radial-gradient"]');
      const style = gradient?.getAttribute('style');
      
      customColors.forEach(color => {
        expect(style).toContain(color);
      });
    });

    it('should use default circle size when not specified', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const gradient = container.querySelector('[style*="width:"][style*="400px"]');
      expect(gradient).toBeInTheDocument();
    });

    it('should apply custom circle size', () => {
      const { container } = render(
        <AnimatedCard circleSize={600}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const gradient = container.querySelector('[style*="width:"][style*="600px"]');
      expect(gradient).toBeInTheDocument();
    });

    it('should apply blur filter to gradient', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const gradient = container.querySelector('[style*="blur(40px)"]');
      expect(gradient).toBeInTheDocument();
    });
  });

  describe('Arrow Icon', () => {
    it('should position arrow correctly', () => {
      const { container } = render(
        <AnimatedCard withArrow={true}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const arrow = container.querySelector('.absolute.right-4.top-4');
      expect(arrow).toBeInTheDocument();
    });

    it('should apply transition classes to arrow', () => {
      const { container } = render(
        <AnimatedCard withArrow={true}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const arrow = container.querySelector('.transition-all.duration-300');
      expect(arrow).toBeInTheDocument();
    });

    it('should have correct z-index for arrow', () => {
      const { container } = render(
        <AnimatedCard withArrow={true}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const arrow = container.querySelector('.z-20');
      expect(arrow).toBeInTheDocument();
    });

    it('should apply hover animation classes to arrow', () => {
      const { container } = render(
        <AnimatedCard withArrow={true}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const arrow = container.querySelector('.group-hover\\:translate-y-0.group-hover\\:opacity-100');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe('Border Animation', () => {
    it('should render animated border gradient', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const borderGradient = container.querySelector('.absolute.inset-0.rounded-2xl.opacity-0');
      expect(borderGradient).toBeInTheDocument();
    });

    it('should apply hover opacity to border', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const borderGradient = container.querySelector('.group-hover\\:opacity-100');
      expect(borderGradient).toBeInTheDocument();
    });

    it('should use gradient colors for border', () => {
      const customColors = ['#ff0000', '#00ff00'];
      
      const { container } = render(
        <AnimatedCard gradientColors={customColors}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const borderGradient = container.querySelector('[style*="linear-gradient"]');
      const style = borderGradient?.getAttribute('style');
      
      expect(style).toContain('#ff0000');
      expect(style).toContain('#00ff00');
    });
  });

  describe('Performance', () => {
    it('should use GPU acceleration', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('transform-gpu');
      
      const gradient = container.querySelector('.transform-gpu');
      expect(gradient).toBeInTheDocument();
    });

    it('should only update on hover state change', () => {
      const { container, rerender } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Initial state
      const initialGradient = container.querySelector('.opacity-0.scale-0');
      expect(initialGradient).toBeInTheDocument();
      
      // Hover
      fireEvent.mouseEnter(card);
      const hoverGradient = container.querySelector('.opacity-100.scale-100');
      expect(hoverGradient).toBeInTheDocument();
      
      // Re-render with same props shouldn't change state
      rerender(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const stillHoverGradient = container.querySelector('.opacity-100.scale-100');
      expect(stillHoverGradient).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain content accessibility', () => {
      render(
        <AnimatedCard>
          <button>Click me</button>
        </AnimatedCard>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeAccessible();
    });

    it('should preserve semantic HTML', () => {
      render(
        <AnimatedCard>
          <article>
            <h2>Article Title</h2>
            <p>Article content</p>
          </article>
        </AnimatedCard>
      );
      
      const article = screen.getByRole('article');
      const heading = screen.getByRole('heading', { level: 2 });
      
      expect(article).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
    });

    it('should not interfere with keyboard navigation', () => {
      const handleClick = jest.fn();
      
      render(
        <AnimatedCard>
          <button onClick={handleClick}>Button</button>
        </AnimatedCard>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<AnimatedCard>{null}</AnimatedCard>);
      
      const card = container.querySelector('.group.relative');
      expect(card).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <AnimatedCard>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </AnimatedCard>
      );
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should handle rapid mouse enter/leave', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Rapid hover events
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      fireEvent.mouseEnter(card);
      
      // Should be in hover state
      const gradient = container.querySelector('.opacity-100.scale-100');
      expect(gradient).toBeInTheDocument();
    });

    it('should handle unmounting during hover', () => {
      const { container, unmount } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(card);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Styling', () => {
    it('should apply rounded corners', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('rounded-2xl');
    });

    it('should apply overflow hidden', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('overflow-hidden');
    });

    it('should apply background and padding', () => {
      const { container } = render(
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white/10', 'p-[2px]');
    });

    it('should maintain z-index hierarchy', () => {
      const { container } = render(
        <AnimatedCard withArrow={true}>
          <div>Content</div>
        </AnimatedCard>
      );
      
      const content = container.querySelector('.relative.z-10');
      const arrow = container.querySelector('.z-20');
      
      expect(content).toBeInTheDocument();
      expect(arrow).toBeInTheDocument();
    });
  });
});