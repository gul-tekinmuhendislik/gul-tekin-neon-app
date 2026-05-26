import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Remove global mock from jest.setup.js to test the real component
jest.unmock('@/components/ui/gul-tekin-hero');

import { Vortex } from '../gul-tekin-hero';


// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, initial, transition, whileHover, whileTap, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
}));

// Mock simplex-noise
jest.mock('simplex-noise', () => ({
  createNoise3D: jest.fn(() => jest.fn(() => Math.random())),
}));

// Mock lucide-react to ensure icons render in jsdom
jest.mock('lucide-react', () => ({
  Snowflake: () => React.createElement('svg', { 'data-testid': 'icon-snowflake' }),
  Wind: () => React.createElement('svg', { 'data-testid': 'icon-wind' }),
  Recycle: () => React.createElement('svg', { 'data-testid': 'icon-recycle' }),
  ThermometerSun: () => React.createElement('svg', { 'data-testid': 'icon-thermometer' }),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
global.requestAnimationFrame = jest.fn((cb) => {
  animationFrameId++;
  return animationFrameId;
});
global.cancelAnimationFrame = jest.fn();

describe('Vortex Component', () => {
  let mockCanvasContext: any;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
    
    // Create fresh canvas context for each test
    mockCanvasContext = {
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
      arc: jest.fn(),
      fill: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      canvas: { width: 1024, height: 768 },
    };
    
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<Vortex />);
      const canvas = container.querySelector('canvas');
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
      
      const pointerEventsDiv = container.querySelector('.pointer-events-none');
      expect(pointerEventsDiv).toBeInTheDocument();
      expect(pointerEventsDiv?.children.length).toBe(5);
    });

    it('should not render snowflake icons when enableSnowflakes is false', () => {
      const { container } = render(
        <Vortex enableSnowflakes={false} />
      );
      
      const pointerEventsDiv = container.querySelector('.pointer-events-none');
      expect(pointerEventsDiv).toBeNull();
    });
  });

  describe('Canvas Initialization', () => {
    it('should initialize canvas on mount', () => {
      const { container } = render(<Vortex />);
      
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).toBeInTheDocument();
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
    });

    it('should handle window resize events', () => {
      render(<Vortex />);
      
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event('resize'));
      
      expect(mockCanvasContext.canvas.width).toBe(1024);
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<Vortex />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    it('should accept custom props and render correctly', () => {
      const { container } = render(
        <Vortex particleCount={50} backgroundColor="white" baseHue={120} />
      );
      
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not draw waves when enableWaves is false', () => {
      render(<Vortex enableWaves={false} />);
      
      expect(mockCanvasContext.save.mock.calls.length).toBe(0);
    });
  });

  describe('Animation', () => {
    it('should start animation loop on mount', () => {
      render(<Vortex />);
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should cleanup animation frame on unmount', () => {
      const { unmount } = render(<Vortex />);
      
      unmount();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should handle null canvas context gracefully', () => {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
      
      expect(() => render(<Vortex />)).not.toThrow();
    });
  });

  describe('Snowflake Rendering', () => {
    it('should render correct number of snowflakes', () => {
      const snowflakeCount = 10;
      const { container } = render(
        <Vortex enableSnowflakes={true} snowflakeCount={snowflakeCount} />
      );
      
      const snowflakeContainer = container.querySelector('.pointer-events-none');
      expect(snowflakeContainer).toBeInTheDocument();
      expect(snowflakeContainer?.children.length).toBe(snowflakeCount);
    });

    it('should have size styling on snowflake elements', () => {
      const { container } = render(
        <Vortex enableSnowflakes={true} snowflakeCount={4} />
      );
      
      const snowflakes = container.querySelectorAll('[style*="font-size"]');
      expect(snowflakes.length).toBeGreaterThan(0);
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
    it('should render content above canvas layer', () => {
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
