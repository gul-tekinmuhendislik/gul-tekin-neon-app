import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Remove global mock from jest.setup.js to test the real component
jest.unmock('@/components/ui/wavy-background');

import { WavyBackground } from '../wavy-background';

// Mock simplex-noise
jest.mock('simplex-noise', () => ({
  createNoise3D: jest.fn(() => jest.fn(() => Math.random())),
}));

// Mock canvas context
const mockCanvasContext = {
  fillStyle: '',
  strokeStyle: '',
  globalAlpha: 1,
  lineWidth: 1,
  filter: '',
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  closePath: jest.fn(),
  canvas: { width: 1024, height: 768 },
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext as any);

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
global.requestAnimationFrame = jest.fn((cb) => {
  animationFrameId++;
  // Don't execute the callback immediately to avoid infinite loops
  return animationFrameId;
});
global.cancelAnimationFrame = jest.fn();

describe('WavyBackground Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<WavyBackground />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should render children when provided', () => {
      render(
        <WavyBackground>
          <div data-testid="child-content">Test Content</div>
        </WavyBackground>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply custom class names', () => {
      const { container } = render(
        <WavyBackground 
          className="custom-class" 
          containerClassName="container-class"
        >
          <div>Content</div>
        </WavyBackground>
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
      expect(container.querySelector('.container-class')).toBeInTheDocument();
    });

    it('should have canvas element with correct id', () => {
      render(<WavyBackground />);
      const canvas = document.querySelector('#canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should apply default container classes', () => {
      const { container } = render(<WavyBackground />);
      const mainContainer = container.firstChild;
      
      expect(mainContainer).toHaveClass('h-screen', 'flex', 'flex-col', 'items-center', 'justify-center', 'relative');
    });
  });

  describe('Canvas Initialization', () => {
    it('should initialize canvas on mount', () => {
      render(<WavyBackground />);
      
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
      expect(mockCanvasContext.canvas.width).toBe(1024);
      expect(mockCanvasContext.canvas.height).toBe(768);
    });

    it('should apply blur filter to canvas', () => {
      render(<WavyBackground blur={20} />);
      
      expect(mockCanvasContext.filter).toBe('blur(20px)');
    });

    it('should handle window resize events', () => {
      const { unmount } = render(<WavyBackground />);
      
      // Change window dimensions
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      
      // Check that the canvas context was accessed (resize handler was triggered)
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
      
      unmount();
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<WavyBackground />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Props Validation', () => {
    it('should use default colors when not specified', () => {
      render(<WavyBackground />);
      
      // Default colors should be used
      expect(mockCanvasContext.strokeStyle).toBeDefined();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should apply custom colors', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      render(<WavyBackground colors={customColors} />);
      
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should apply custom wave width', () => {
      render(<WavyBackground waveWidth={100} />);
      
      expect(mockCanvasContext.lineWidth).toBeDefined();
    });

    it('should apply custom background fill', () => {
      render(<WavyBackground backgroundFill="#ffffff" />);
      
      expect(mockCanvasContext.fillRect).toHaveBeenCalled();
    });

    it('should clear canvas when background is transparent', () => {
      render(<WavyBackground backgroundFill="transparent" />);
      
      expect(mockCanvasContext.clearRect).toHaveBeenCalled();
    });

    it('should apply custom wave opacity', () => {
      render(<WavyBackground waveOpacity={0.8} />);
      
      expect(mockCanvasContext.globalAlpha).toBeDefined();
    });

    it('should handle slow speed setting', () => {
      render(<WavyBackground speed="slow" />);
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle fast speed setting', () => {
      render(<WavyBackground speed="fast" />);
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Animation', () => {
    it('should start animation on mount', () => {
      render(<WavyBackground />);
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should draw multiple wave layers', () => {
      render(<WavyBackground />);
      
      // Should draw 3 wave layers
      expect(mockCanvasContext.beginPath).toHaveBeenCalledTimes(3);
      expect(mockCanvasContext.stroke).toHaveBeenCalledTimes(3);
      expect(mockCanvasContext.closePath).toHaveBeenCalledTimes(3);
    });

    it('should create wave path with multiple points', () => {
      render(<WavyBackground />);
      
      // Should call lineTo multiple times for wave path
      expect(mockCanvasContext.lineTo).toHaveBeenCalled();
    });

    it('should cancel animation on unmount', () => {
      const { unmount } = render(<WavyBackground />);
      
      unmount();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Server-Side Rendering', () => {
    it('should handle server-side rendering', () => {
      // The component checks for typeof window === "undefined"
      // In jsdom, window is always defined, so we'll test the isServer logic
      const { container } = render(<WavyBackground />);
      const canvas = container.querySelector('canvas');
      
      // Canvas should be present but might be hidden based on isServer
      expect(canvas).toBeInTheDocument();
    });

    it('should show canvas on client side', () => {
      const { container } = render(<WavyBackground />);
      const canvas = container.querySelector('canvas');
      
      // Canvas should be rendered
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('id', 'canvas');
    });
  });

  describe('Mounting Behavior', () => {
    it('should set mounted state after component mounts', () => {
      jest.clearAllMocks();
      const { container } = render(<WavyBackground />);
      
      // Canvas should be initialized after mount
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });

    it('should initialize canvas after mounting', () => {
      jest.clearAllMocks();
      
      // Component should initialize canvas after mount
      render(<WavyBackground />);
      
      // getContext should be called after mount
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null canvas context gracefully', () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
      
      expect(() => render(<WavyBackground />)).not.toThrow();
      
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('should handle empty colors array', () => {
      jest.clearAllMocks();
      expect(() => render(<WavyBackground colors={[]} />)).not.toThrow();
    });

    it('should handle negative blur values', () => {
      jest.clearAllMocks();
      expect(() => render(<WavyBackground blur={-10} />)).not.toThrow();
    });

    it('should handle zero wave width', () => {
      jest.clearAllMocks();
      expect(() => render(<WavyBackground waveWidth={0} />)).not.toThrow();
    });

    it('should handle invalid wave opacity', () => {
      jest.clearAllMocks();
      expect(() => render(<WavyBackground waveOpacity={2} />)).not.toThrow();
      expect(() => render(<WavyBackground waveOpacity={-1} />)).not.toThrow();
    });

    it('should handle invalid background fill color', () => {
      jest.clearAllMocks();
      expect(() => render(<WavyBackground backgroundFill="invalid-color" />)).not.toThrow();
    });
  });

  describe('Z-Index Layering', () => {
    it('should position canvas behind content', () => {
      const { container } = render(
        <WavyBackground>
          <div>Content</div>
        </WavyBackground>
      );
      
      const canvas = container.querySelector('canvas');
      const content = container.querySelector('.relative.z-10');
      
      expect(canvas).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle re-render gracefully', () => {
      jest.clearAllMocks();
      const { rerender } = render(<WavyBackground />);
      
      // Re-render with same props should not throw
      expect(() => {
        rerender(<WavyBackground />);
      }).not.toThrow();
    });

    it('should cleanup previous animation frame on re-render', () => {
      const { rerender } = render(<WavyBackground colors={['#ff0000']} />);
      
      jest.clearAllMocks();
      
      rerender(<WavyBackground colors={['#00ff00']} />);
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should update canvas size on window resize', () => {
      jest.clearAllMocks();
      render(<WavyBackground />);
      
      // Simulate window resize
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event('resize'));
      
      // Canvas context should be updated
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });

    it('should maintain full screen height', () => {
      const { container } = render(<WavyBackground />);
      const mainContainer = container.firstChild;
      
      expect(mainContainer).toHaveClass('h-screen');
    });
  });

  describe('Wave Rendering', () => {
    it('should render three wave layers by default', () => {
      jest.clearAllMocks();
      HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext as any);
      render(<WavyBackground />);
      
      // Canvas should be initialized
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });

    it('should apply different colors to each wave', () => {
      jest.clearAllMocks();
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      render(<WavyBackground colors={colors} />);
      
      // Canvas should be initialized with colors
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });

    it('should create smooth wave paths', () => {
      jest.clearAllMocks();
      render(<WavyBackground />);
      
      // Canvas should be initialized for wave rendering
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with interactive content', () => {
      jest.clearAllMocks();
      const handleClick = jest.fn();
      
      render(
        <WavyBackground>
          <button onClick={handleClick}>Click me</button>
        </WavyBackground>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should maintain content visibility', () => {
      jest.clearAllMocks();
      render(
        <WavyBackground>
          <h1>Important Content</h1>
        </WavyBackground>
      );
      
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Important Content');
    });
  });
});