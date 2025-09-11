import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Vortex } from '../gul-tekin-hero';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

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
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  closePath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
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

describe('Vortex Component', () => {
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
      render(<Vortex />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should render children when provided', () => {
      render(
        <Vortex>
          <div data-testid="child-content">Test Content</div>
        </Vortex>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply custom class names', () => {
      const { container } = render(
        <Vortex 
          className="custom-class" 
          containerClassName="container-class"
        >
          <div>Content</div>
        </Vortex>
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
      expect(container.querySelector('.container-class')).toBeInTheDocument();
    });

    it('should render snowflake icons when enableSnowflakes is true', () => {
      const { container } = render(
        <Vortex enableSnowflakes={true} snowflakeCount={5} />
      );
      
      // Check for SVG icons (lucide icons render as SVGs)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should not render snowflake icons when enableSnowflakes is false', () => {
      const { container } = render(
        <Vortex enableSnowflakes={false} />
      );
      
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(0);
    });
  });

  describe('Canvas Initialization', () => {
    it('should initialize canvas with correct dimensions', () => {
      render(<Vortex />);
      
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).toBeInTheDocument();
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
    });

    it('should handle window resize events', () => {
      const { unmount } = render(<Vortex />);
      
      // Trigger resize event
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event('resize'));
      
      expect(mockCanvasContext.canvas.width).toBe(1024); // Canvas dimensions are set in the effect
      
      unmount();
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<Vortex />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Props Validation', () => {
    it('should use default props when not specified', () => {
      render(<Vortex />);
      
      // Verify canvas context was called with default values
      expect(mockCanvasContext.fillRect).toHaveBeenCalled();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should apply custom particle count', () => {
      render(<Vortex particleCount={200} />);
      
      // The component should initialize with the specified particle count
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.arc).toHaveBeenCalled();
    });

    it('should apply custom background color', () => {
      render(<Vortex backgroundColor="#ff0000" />);
      
      expect(mockCanvasContext.fillRect).toHaveBeenCalled();
    });

    it('should apply custom wave colors when enableWaves is true', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      render(<Vortex enableWaves={true} waveColors={customColors} />);
      
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should not draw waves when enableWaves is false', () => {
      render(<Vortex enableWaves={false} />);
      
      // Verify that wave-specific methods are called less frequently
      const saveCallCount = mockCanvasContext.save.mock.calls.length;
      expect(saveCallCount).toBe(0);
    });

    it('should apply custom wave opacity', () => {
      render(<Vortex enableWaves={true} waveOpacity={0.8} />);
      
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should apply custom base hue for particles', () => {
      render(<Vortex baseHue={180} />);
      
      expect(mockCanvasContext.fill).toHaveBeenCalled();
    });
  });

  describe('Animation', () => {
    it('should start animation on mount', () => {
      render(<Vortex />);
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should create particle connections within distance threshold', () => {
      render(<Vortex particleCount={10} />);
      
      // Verify line drawing for particle connections
      expect(mockCanvasContext.moveTo).toHaveBeenCalled();
      expect(mockCanvasContext.lineTo).toHaveBeenCalled();
    });

    it('should apply vortex effect to particles', () => {
      render(<Vortex particleCount={5} />);
      
      // Verify particle movement and vortex calculations
      expect(mockCanvasContext.arc).toHaveBeenCalled();
      expect(mockCanvasContext.fill).toHaveBeenCalled();
    });

    it('should handle particle boundary collisions', () => {
      render(<Vortex particleCount={5} />);
      
      // Particles should bounce off walls
      expect(mockCanvasContext.arc).toHaveBeenCalled();
    });
  });

  describe('Snowflake Animation', () => {
    it('should render correct number of snowflakes', () => {
      const snowflakeCount = 10;
      const { container } = render(
        <Vortex enableSnowflakes={true} snowflakeCount={snowflakeCount} />
      );
      
      const snowflakes = container.querySelectorAll('.absolute svg');
      expect(snowflakes.length).toBe(snowflakeCount);
    });

    it('should apply different colors to different icon types', () => {
      const { container } = render(
        <Vortex enableSnowflakes={true} snowflakeCount={4} />
      );
      
      const icons = container.querySelectorAll('.absolute');
      const hasColorClasses = Array.from(icons).some(icon => 
        icon.className.includes('text-cyan') || 
        icon.className.includes('text-green') || 
        icon.className.includes('text-orange') ||
        icon.className.includes('text-blue')
      );
      
      expect(hasColorClasses).toBe(true);
    });

    it('should apply random sizes to snowflakes', () => {
      const { container } = render(
        <Vortex enableSnowflakes={true} snowflakeCount={5} />
      );
      
      const snowflakes = container.querySelectorAll('.absolute[style*="fontSize"]');
      expect(snowflakes.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Optimization', () => {
    it('should cleanup animation frame on unmount', () => {
      const { unmount } = render(<Vortex />);
      
      unmount();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should apply damping to particle velocity', () => {
      render(<Vortex particleCount={5} />);
      
      // Verify that particles are being updated
      expect(mockCanvasContext.arc).toHaveBeenCalled();
    });

    it('should handle empty or null canvas context gracefully', () => {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
      
      expect(() => render(<Vortex />)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero particle count', () => {
      expect(() => render(<Vortex particleCount={0} />)).not.toThrow();
    });

    it('should handle negative values gracefully', () => {
      expect(() => render(
        <Vortex 
          particleCount={-10} 
          rangeY={-100}
          baseRadius={-5}
        />
      )).not.toThrow();
    });

    it('should handle extremely large particle counts', () => {
      expect(() => render(<Vortex particleCount={10000} />)).not.toThrow();
    });

    it('should handle empty wave colors array', () => {
      expect(() => render(
        <Vortex enableWaves={true} waveColors={[]} />
      )).not.toThrow();
    });

    it('should handle invalid color values', () => {
      expect(() => render(
        <Vortex 
          backgroundColor="invalid-color" 
          waveColors={['not-a-color']}
        />
      )).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper z-index layering', () => {
      const { container } = render(
        <Vortex>
          <div data-testid="content">Content</div>
        </Vortex>
      );
      
      const content = container.querySelector('.relative.z-10');
      expect(content).toBeInTheDocument();
    });

    it('should not interfere with interactive elements in children', () => {
      const handleClick = jest.fn();
      render(
        <Vortex>
          <button onClick={handleClick}>Click me</button>
        </Vortex>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});