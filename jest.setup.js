// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add Groq SDK shim for Node.js environment
import 'groq-sdk/shims/node'

// Add TextDecoder/TextEncoder for Node.js environment
import { TextDecoder, TextEncoder } from 'util'
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

// Ensure timer globals from Node.js are available in JSDOM
// In Node.js 26 + JSDOM, clearInterval/setInterval may not be accessible
// as free variables from React cleanup functions. Source them from 'timers'.
const timers = require('timers');
globalThis.clearInterval = timers.clearInterval;
globalThis.setInterval = timers.setInterval;
global.clearInterval = timers.clearInterval;
global.setInterval = timers.setInterval;

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test@localhost/test'
process.env.GROQ_API_KEY = 'test-groq-key'
process.env.EXA_API_KEY = 'test-exa-key'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.OPENAI_API_KEY = 'test-openai-key'

// ---------------------------------------------------------------------------
// Global mocks — these run before per-test-file mocks, so test files can
// still override them with their own jest.mock() calls.
// ---------------------------------------------------------------------------

// Mock @/lib/db — many components do SQL queries that hang in test env
jest.mock('@/lib/db', () => {
  // Return a sql tagged-template function that returns empty results
  const sql = jest.fn().mockImplementation(() => Promise.resolve([]))
  return { sql }
})

// Mock canvas-based UI components that crash in JSDOM (no real canvas context)
jest.mock('@/components/ui/gul-tekin-hero', () => {
  const React = require('react')
  const Vortex = function VortexMock(props) {
    return React.createElement('div', { 'data-testid': 'vortex', className: props.className }, props.children)
  }
  return { Vortex }
})

jest.mock('@/components/ui/wavy-background', () => {
  const React = require('react')
  const WavyBackground = function WavyBackgroundMock(props) {
    return React.createElement('div', { className: props.className },
      props.children,
      React.createElement('canvas', { id: 'wavy-canvas' })
    )
  }
  return { WavyBackground }
})

jest.mock('@/components/ui/animated-card', () => {
  const React = require('react')
  const AnimatedCard = function AnimatedCardMock(props) {
    return React.createElement('div', {
      className: `${props.className || ''} rounded-xl bg-white p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-[0.98]`,
      'data-testid': 'animated-card'
    }, props.children)
  }
  return { AnimatedCard }
})

// Mock FeatureSection — uses setInterval/clearInterval which fails in JSDOM cleanup
jest.mock('@/components/ui/feature-section', () => {
  const React = require('react')
  const FeatureSection = function FeatureSectionMock() {
    return React.createElement('section', { 'data-testid': 'feature-section', className: 'py-16 px-4 md:px-8 max-w-5xl mx-auto' },
      React.createElement('h2', { className: 'text-3xl font-bold text-center mb-4' }, 'Neden Bizi Seçmelisiniz?'),
      React.createElement('p', { className: 'text-lg text-center text-gray-600 mb-12' }, 'Size özel çözümlerimizle fark yaratıyoruz'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-8' },
        [1, 2, 3].map(function(i) {
          return React.createElement('div', {
            key: i,
            className: 'bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl'
          },
            React.createElement('div', { className: 'w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mb-4' },
              React.createElement('span', { className: 'text-white font-bold text-lg' }, i)
            ),
            React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Hizmet ' + i),
            React.createElement('p', { className: 'text-gray-600' }, 'Detaylı bilgi için tıklayın')
          )
        })
      )
    )
  }
  return { FeatureSection }
})

// Mock LogoCloud — produce a complete mock with logos that tests expect
jest.mock('@/components/ui/logo-cloud', () => {
  const React = require('react')

  const partners = [
    { name: 'Aldea', logo: '/aldea.jpeg' },
    { name: 'REHAU', logo: '/REHAU.png' },
    { name: 'Solimpeks', logo: '/solimpeks.png' },
    { name: 'Varmek', logo: '/varmek.png' },
    { name: 'Wepomp', logo: '/wepomp.png' },
    { name: 'Wilo', logo: '/wilo.png' },
    { name: 'Yelkenci', logo: '/yelkenci.png' },
    { name: 'Vaillant', logo: '/vaillant.png' },
    { name: 'Bosch', logo: '/bosch.png' },
    { name: 'Daikin', logo: '/daikin.png' },
    { name: 'Baymak', logo: '/baymak.png' },
    { name: 'E.C.A.', logo: '/eca.png' },
    { name: 'Demirdöküm', logo: '/demirdokum.png' },
  ]

  const LogoCloud = function LogoCloudMock() {
    return React.createElement('section', { id: 'partners', className: 'px-6 md:px-8 py-16 mx-auto max-w-7xl' },
      React.createElement('div', { className: 'mx-auto max-w-screen-xl px-4 md:px-8' },
        React.createElement('h2', { className: 'text-center text-sm font-semibold text-gray-600 uppercase tracking-wide' }, 'Çözüm Ortaklarımız'),
        React.createElement('p', { className: 'mt-2 text-base text-gray-500 text-center' }, 'Sektörün lider markalarıyla güvenilir çözümler sunuyoruz')
      ),
      React.createElement('ul', { className: 'flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16 mt-8' },
        partners.map(function(p) {
          return React.createElement('li', { key: p.name },
            React.createElement('div', { className: 'flex items-center justify-center h-12 w-32 relative grayscale opacity-60 hover:opacity-100 transition-all duration-300' },
              React.createElement('img', {
                src: p.logo,
                alt: p.name + ' logosu',
                className: 'object-contain w-full h-full',
                width: 128,
                height: 48,
                'data-priority': 'true'
              })
            )
          )
        })
      )
    )
  }

  return { LogoCloud }
})

// Mock IntegrationsSection — more complete than bare-minimum mock
jest.mock('@/components/ui/integrations-section', () => {
  const React = require('react')

  const services = [
    { name: 'Isı Pompası', icon: 'flame' },
    { name: 'Güneş Enerjisi', icon: 'sun' },
    { name: 'Su Arıtma', icon: 'droplet' },
    { name: 'Kombi', icon: 'thermometer' },
    { name: 'Klima', icon: 'wind' },
    { name: 'Tesisat', icon: 'wrench' },
  ]

  const IntegrationsSection = function IntegrationsSectionMock() {
    return React.createElement('section', { id: 'integrations', className: 'py-16 relative z-10 bg-white' },
      React.createElement('div', { className: 'container mx-auto px-4 md:px-8 max-w-5xl' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-4' }, 'Hizmetler'),
        React.createElement('p', { className: 'text-base text-gray-500 text-center max-w-2xl mx-auto mb-8' },
          'Sıhhi tesisat, güneş enerjisi sistemleri ve ısı pompası çözümleri.'
        ),
        React.createElement('div', { className: 'flex overflow-hidden p-2 relative' },
          React.createElement('div', { className: 'flex shrink-0 justify-around animate-marquee group-hover:[animation-play-state:paused] transform-gpu' },
            services.concat(services).concat(services).concat(services).map(function(s, i) {
              return React.createElement('div', {
                key: i,
                className: 'relative size-20 mx-4 cursor-pointer bg-white rounded-xl shadow-lg hover:scale-[1.15] transition-all duration-300'
              },
                React.createElement('div', { className: 'flex size-full items-center justify-center text-gray-600' },
                  React.createElement('div', { className: 'w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full' })
                )
              )
            })
          )
        )
      ),
      React.createElement('div', { className: 'pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10' }),
      React.createElement('div', { className: 'pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10' })
    )
  }

  return { IntegrationsSection }
})

// Mock FlipWords — use the __mocks__/flip-words.tsx
jest.mock('@/components/ui/flip-words')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Inngest client
jest.mock('./lib/inngest/client', () => ({
  inngest: {
    createFunction: jest.fn(function(config, trigger, handler) { return handler }),
    send: jest.fn(),
  },
}))

// Global test utilities
global.fetch = jest.fn()

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Suppress console errors and logs in tests (optional)
var originalError = console.error
var originalLog = console.log
beforeAll(() => {
  console.error = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  console.error = originalError
  console.log = originalLog
})
