// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add Groq SDK shim for Node.js environment
import 'groq-sdk/shims/node'

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test@localhost/test'
process.env.GROQ_API_KEY = 'test-groq-key'
process.env.EXA_API_KEY = 'test-exa-key'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.OPENAI_API_KEY = 'test-openai-key'

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
    createFunction: jest.fn((config, trigger, handler) => handler),
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
const originalError = console.error
const originalLog = console.log
beforeAll(() => {
  console.error = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  console.error = originalError
  console.log = originalLog
})